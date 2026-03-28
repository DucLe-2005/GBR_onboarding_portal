from supabase import Client, create_client
from supabase.lib.client_options import ClientOptions

from app.core.config import get_settings

settings = get_settings()

# Normal client: use for verifying user tokens and user-scoped operations
supabase: Client = create_client(
    settings.supabase_url,
    settings.supabase_anon_key,
)

# Admin client: use only for trusted backend-only admin actions
supabase_admin: Client = create_client(
    settings.supabase_url,
    settings.supabase_service_role_key,
    options=ClientOptions(
        auto_refresh_token=False,
        persist_session=False,
    ),
)