from functools import lru_cache
from supabase import Client, create_client
from supabase.lib.client_options import SyncClientOptions

from app.core.config import get_settings


@lru_cache
def get_supabase_client() -> Client:
    """
    Anon client (used for lightweight auth checks like get_user).
    """
    settings = get_settings()
    return create_client(
        settings.supabase_url,
        settings.supabase_anon_key,
    )


@lru_cache
def get_service_supabase_client() -> Client:
    """
    Service-role client (admin privileges, bypasses RLS).
    """
    settings = get_settings()
    return create_client(
        settings.supabase_url,
        settings.supabase_service_role_key,
        options=SyncClientOptions(
            auto_refresh_token=False,
            persist_session=False,
        ),
    )


def get_user_supabase_client(access_token: str) -> Client:
    """
    User-scoped Supabase client.
    """
    settings = get_settings()

    client = create_client(
        settings.supabase_url,
        settings.supabase_anon_key,
        options=SyncClientOptions(
            auto_refresh_token=False,
            persist_session=False,
        ),
    )

    # Attach JWT → DB queries
    client.postgrest.auth(access_token)

    return client