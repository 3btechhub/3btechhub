# Supabase migrations

The migration files are retained in remote execution order and mirror the connected Supabase project's applied schema and security changes.

- 20261125122019 create_service_categories (historical, superseded)
- 20261126225223 drop_empty_public_schema (historical cleanup)
- 20261127233734 create_approved_core_schema_and_security
- 20261127233756 index_access_paths_and_optimize_rls
- 20261127233834 tighten_role_reads_and_system_role_guards
- 20261127233904 centralize_content_visibility_and_secure_media_storage
- 20261127233921 grant_visibility_validation_helper
- 20261127234018 protect_reserved_owner_email_for_admin_api
- 20261127234551 enforce_owner_immutability_without_service_bypass
- 20261127234810 protect_reserved_owner_auth_identity_before_bootstrap
- 20261127235203 preserve_owner_permission_invariants
- 20261127235225 correct_owner_permission_guard_update_return
- 20261127235553 seed_configured_regions
- 20261127235708 fix_media_storage_object_read_scope

The first two versions are intentionally no-op historical placeholders; the legacy schema was superseded by the approved baseline. The connected project has all listed versions applied.