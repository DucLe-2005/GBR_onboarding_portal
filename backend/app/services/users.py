from functools import lru_cache
from typing import Any

from fastapi import HTTPException, status
from pydantic import BaseModel
from supabase import Client

from app.core.supabase_client import get_service_supabase_client
from app.lib.email import EmailSendError, send_account_created_email
from app.repository.users import UserRepository
from app.schemas.users import (
    CreateUserRequest,
    UpdateUserRequest,
    get_current_step_for_role,
)


class EmailPayload(BaseModel):
    email: str
    first_name: str
    last_name: str
    role: str


class UserService:
    """
    Service layer for user management flows.
    """

    def __init__(self) -> None:
        self._get_supabase_client = get_service_supabase_client
        self.repo = UserRepository()

    # =========================
    # helper functions
    # =========================

    def _build_metadata_update(
        self,
        existing_metadata: dict[str, Any],
        update_data: dict[str, Any],
    ) -> dict[str, Any]:
        """
        Merge editable fields into Supabase user_metadata.
        """
        new_metadata = dict(existing_metadata)

        if "first_name" in update_data:
            new_metadata["first_name"] = update_data["first_name"]

        if "last_name" in update_data:
            new_metadata["last_name"] = update_data["last_name"]

        if "company_name" in update_data:
            new_metadata["company_name"] = update_data["company_name"]

        return new_metadata

    # =========================
    # user flow
    # =========================

    def get_my_account(
        self,
        supabase: Client,
        access_token: str,
    ) -> dict[str, Any]:
        """
        Return the current user's profile.
        """
        return self.repo.get_my_user_profile(supabase, access_token)

    def update_my_account(
        self,
        supabase: Client,
        access_token: str,
        payload: UpdateUserRequest,
    ) -> dict[str, Any]:
        """
        Update the current user's own profile.
        """
        existing_profile = self.repo.get_my_user_profile(supabase, access_token)
        update_data = payload.model_dump(exclude_unset=True)

        if not update_data:
            return existing_profile

        auth_user = self.repo.get_current_auth_user(supabase, access_token)
        existing_metadata = auth_user.user_metadata or {}
        new_metadata = self._build_metadata_update(existing_metadata, update_data)

        auth_update_payload: dict[str, Any] = {}

        if "phone_number" in update_data:
            auth_update_payload["phone"] = update_data["phone_number"]

        if any(field in update_data for field in ["first_name", "last_name", "company_name"]):
            auth_update_payload["user_metadata"] = new_metadata

        try:
            if auth_update_payload:
                admin_supabase = self._get_supabase_client()
                self.repo.update_auth_user_by_id_admin(
                    admin_supabase,
                    auth_user.id,
                    auth_update_payload,
                )
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to update auth user: {str(exc)}",
            ) from exc

        return self.repo.get_my_user_profile(supabase, access_token)

    # =========================
    # admin flow
    # =========================

    def get_buyer_seller_users(self) -> list[dict[str, Any]]:
        """
        Admin: get all buyer and seller users.
        """
        supabase = self._get_supabase_client()
        return self.repo.list_buyer_seller_users(supabase)

    def get_buyer_seller_user_by_id(self, user_id: str) -> dict[str, Any]:
        """
        Admin: get a single buyer/seller user.
        """
        supabase = self._get_supabase_client()
        user = self.repo.get_user_profile_by_id(supabase, user_id)

        if user["role"] not in {"buyer", "seller"}:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Buyer/Seller user not found",
            )

        return user

    def update_user_by_admin(
        self,
        user_id: str,
        payload: UpdateUserRequest,
    ) -> dict[str, Any]:
        """
        Admin: update another user's profile.
        """
        supabase = self._get_supabase_client()

        existing_profile = self.repo.get_user_profile_by_id(supabase, user_id)
        update_data = payload.model_dump(exclude_unset=True)

        if not update_data:
            return existing_profile

        auth_user = self.repo.get_auth_user_by_id_admin(supabase, user_id)
        existing_metadata = auth_user.user_metadata or {}
        new_metadata = self._build_metadata_update(existing_metadata, update_data)

        auth_update_payload: dict[str, Any] = {}

        if "phone_number" in update_data:
            auth_update_payload["phone"] = update_data["phone_number"]

        if any(field in update_data for field in ["first_name", "last_name", "company_name"]):
            auth_update_payload["user_metadata"] = new_metadata

        try:
            if auth_update_payload:
                self.repo.update_auth_user_by_id_admin(
                    supabase,
                    user_id,
                    auth_update_payload,
                )
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to update auth user: {str(exc)}",
            ) from exc

        return self.repo.get_user_profile_by_id(supabase, user_id)

    # =========================
    # create + email
    # =========================

    def create_user_by_admin(self, payload: CreateUserRequest) -> Any:
        """
        Admin: create a new user and send verification email.
        """
        supabase = self._get_supabase_client()
        current_step = get_current_step_for_role(payload.role)

        try:
            response = supabase.auth.admin.create_user(
                {
                    "email": payload.email,
                    "password": payload.password,
                    "email_confirm": False,
                    "phone": payload.phone_number,
                    "user_metadata": {
                        "first_name": payload.first_name,
                        "last_name": payload.last_name,
                        "role": payload.role,
                        "current_step": current_step,
                        "company_name": payload.company_name,
                    },
                }
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to create user: {str(e)}",
            ) from e

        self.send_confirmation_email(
            EmailPayload(
                email=payload.email,
                first_name=payload.first_name,
                last_name=payload.last_name,
                role=payload.role,
            )
        )

        return response

    def send_confirmation_email(self, payload: EmailPayload) -> None:
        """
        Send Supabase-generated invite link through SMTP.
        """
        supabase = self._get_supabase_client()

        try:
            response = supabase.auth.admin.generate_link(
                {
                    "type": "invite",
                    "email": payload.email,
                }
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to generate confirmation link: {str(e)}",
            ) from e

        try:
            action_link = response.properties.action_link
        except AttributeError:
            try:
                action_link = response["properties"]["action_link"]
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Confirmation link was created but could not be read from the Supabase response.",
                ) from e

        try:
            send_account_created_email(
                to_email=payload.email,
                first_name=payload.first_name,
                last_name=payload.last_name,
                role=payload.role,
                confirmation_link=action_link,
            )
        except EmailSendError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to send confirmation email: {str(e)}",
            ) from e

    def resend_verification_email_by_admin(self, user_id: str) -> dict[str, Any]:
        """
        Admin: resend the verification email for a buyer or seller user.
        """
        user = self.get_buyer_seller_user_by_id(user_id)

        if user["email_verified"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User email is already verified",
            )

        self.send_confirmation_email(
            EmailPayload(
                email=user["email"],
                first_name=user["first_name"],
                last_name=user["last_name"],
                role=user["role"],
            )
        )

        return {
            "message": "Verification email sent successfully",
            "user_id": user["id"],
            "email": user["email"],
        }


@lru_cache
def get_users_service() -> UserService:
    return UserService()