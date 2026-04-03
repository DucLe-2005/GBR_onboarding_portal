from fastapi import APIRouter, HTTPException

from app.services.docusign_auth import (
    DocusignAuthError,
    DocusignConsentRequiredError,
    DocusignAuthService,
)

from app.schemas.docusign import CallBackResponse

router = APIRouter(prefix="/docusign", tags=["docusign"])


@router.get("/auth/test")
def test_docusign_auth():
    service = DocusignAuthService()

    try:
        token = service.get_access_token()
        return {
            "ok": True,
            "expires_in": token.expires_in,
            "token_preview": token.access_token[:20] + "...",
        }
    except DocusignConsentRequiredError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except DocusignAuthError as e:
        raise HTTPException(status_code=500, detail=str(e))

# Callback URI that Docusign calls after giving consent to app
@router.get("/callback", response_model=CallBackResponse)
def docusign_callback() -> CallBackResponse:
    return {
        "message": "DocuSign callback reached",
    }
