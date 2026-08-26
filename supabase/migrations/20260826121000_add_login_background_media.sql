-- Canonical shared Login-media control plane for Admin producer and five login consumers.
-- TEST MODE verification support; no direct client table access.

CREATE TABLE IF NOT EXISTS public.login_background_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (char_length(btrim(title)) BETWEEN 1 AND 160),
  target_app text NOT NULL CHECK (target_app IN ('all', 'customer', 'admin', 'merchant', 'rider', 'retail_pos')),
  media_kind text NOT NULL CHECK (media_kind IN ('static_image', 'animated_gif')),
  storage_path text NOT NULL UNIQUE CHECK (storage_path ~ '^login-media/[0-9a-f-]{36}[.](jpg|gif)$'),
  public_url text NOT NULL CHECK (public_url ~ '^https://[^/]+[.]supabase[.]co/storage/v1/object/public/catalog/login-media/'),
  festival_key text,
  starts_at timestamptz,
  ends_at timestamptz,
  priority integer NOT NULL DEFAULT 0 CHECK (priority BETWEEN -100000 AND 100000),
  overlay_opacity numeric(3,2) NOT NULL DEFAULT 0.18 CHECK (overlay_opacity BETWEEN 0 AND 0.85),
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT login_background_media_time_order CHECK (ends_at IS NULL OR starts_at IS NULL OR ends_at > starts_at),
  CONSTRAINT login_background_media_kind_path CHECK (
    (media_kind = 'animated_gif' AND storage_path ~ '[.]gif$')
    OR (media_kind = 'static_image' AND storage_path ~ '[.]jpg$')
  )
);

CREATE INDEX IF NOT EXISTS login_background_media_active_target_priority_idx
  ON public.login_background_media (is_active, target_app, priority DESC, starts_at, ends_at);

ALTER TABLE public.login_background_media ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.login_background_media FROM PUBLIC;
REVOKE ALL ON TABLE public.login_background_media FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.admin_list_login_background_media()
RETURNS TABLE (
  id uuid,
  title text,
  target_app text,
  media_kind text,
  public_url text,
  festival_key text,
  starts_at timestamptz,
  ends_at timestamptz,
  priority integer,
  overlay_opacity numeric,
  is_active boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'public', 'private', 'auth', 'pg_temp'
AS $$
  SELECT m.id, m.title, m.target_app, m.media_kind, m.public_url, m.festival_key,
         m.starts_at, m.ends_at, m.priority, m.overlay_opacity, m.is_active
  FROM public.login_background_media AS m
  WHERE public.is_creator_affiliate_admin() OR private.is_platform_owner_or_master()
  ORDER BY m.priority DESC, m.created_at DESC
  LIMIT 200;
$$;

CREATE OR REPLACE FUNCTION public.admin_upsert_login_background_media(
  p_title text,
  p_target_app text,
  p_media_kind text,
  p_storage_path text,
  p_public_url text,
  p_festival_key text,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_priority integer,
  p_overlay_opacity numeric,
  p_is_active boolean
)
RETURNS uuid
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'public', 'private', 'auth', 'pg_temp'
AS $$
DECLARE
  result_id uuid;
BEGIN
  IF NOT (public.is_creator_affiliate_admin() OR private.is_platform_owner_or_master()) THEN
    RAISE EXCEPTION 'Admin authorization required';
  END IF;
  IF nullif(btrim(p_title), '') IS NULL OR char_length(btrim(p_title)) > 160 THEN
    RAISE EXCEPTION 'Invalid login media title';
  END IF;
  IF p_target_app NOT IN ('all', 'customer', 'admin', 'merchant', 'rider', 'retail_pos') THEN
    RAISE EXCEPTION 'Invalid login media target';
  END IF;
  IF p_media_kind NOT IN ('static_image', 'animated_gif') THEN
    RAISE EXCEPTION 'Invalid login media kind';
  END IF;
  IF p_storage_path !~ '^login-media/[0-9a-f-]{36}[.](jpg|gif)$' THEN
    RAISE EXCEPTION 'Invalid login media storage path';
  END IF;
  IF p_public_url !~ '^https://[^/]+[.]supabase[.]co/storage/v1/object/public/catalog/login-media/' THEN
    RAISE EXCEPTION 'Invalid login media public URL';
  END IF;
  IF (p_media_kind = 'animated_gif' AND p_storage_path !~ '[.]gif$')
     OR (p_media_kind = 'static_image' AND p_storage_path !~ '[.]jpg$') THEN
    RAISE EXCEPTION 'Login media kind does not match storage path';
  END IF;
  IF p_ends_at IS NOT NULL AND p_starts_at IS NOT NULL AND p_ends_at <= p_starts_at THEN
    RAISE EXCEPTION 'Login media end must be after start';
  END IF;
  IF p_overlay_opacity IS NULL OR p_overlay_opacity < 0 OR p_overlay_opacity > 0.85 THEN
    RAISE EXCEPTION 'Invalid login media opacity';
  END IF;

  INSERT INTO public.login_background_media (
    title, target_app, media_kind, storage_path, public_url, festival_key,
    starts_at, ends_at, priority, overlay_opacity, is_active, created_by
  ) VALUES (
    btrim(p_title), p_target_app, p_media_kind, p_storage_path, p_public_url,
    nullif(btrim(p_festival_key), ''), p_starts_at, p_ends_at,
    coalesce(p_priority, 0), p_overlay_opacity, coalesce(p_is_active, true), auth.uid()
  )
  RETURNING id INTO result_id;

  RETURN result_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_disable_login_background_media(p_id uuid)
RETURNS boolean
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'public', 'private', 'auth', 'pg_temp'
AS $$
DECLARE
  changed integer;
BEGIN
  IF NOT (public.is_creator_affiliate_admin() OR private.is_platform_owner_or_master()) THEN
    RAISE EXCEPTION 'Admin authorization required';
  END IF;
  UPDATE public.login_background_media
  SET is_active = false, updated_at = now()
  WHERE id = p_id;
  GET DIAGNOSTICS changed = ROW_COUNT;
  RETURN changed > 0;
END;
$$;

CREATE OR REPLACE FUNCTION public.login_resolve_background_media(p_target_app text)
RETURNS TABLE (
  id uuid,
  title text,
  target_app text,
  media_kind text,
  public_url text,
  festival_key text,
  starts_at timestamptz,
  ends_at timestamptz,
  priority integer,
  overlay_opacity numeric,
  is_active boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'public', 'private', 'auth', 'pg_temp'
AS $$
  SELECT m.id, m.title, m.target_app, m.media_kind, m.public_url, m.festival_key,
         m.starts_at, m.ends_at, m.priority, m.overlay_opacity, m.is_active
  FROM public.login_background_media AS m
  WHERE m.is_active = true
    AND (m.target_app = 'all' OR m.target_app = p_target_app)
    AND (m.starts_at IS NULL OR m.starts_at <= now())
    AND (m.ends_at IS NULL OR m.ends_at > now())
  ORDER BY m.priority DESC, m.created_at DESC
  LIMIT 20;
$$;

REVOKE ALL ON FUNCTION public.admin_list_login_background_media() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.admin_upsert_login_background_media(text, text, text, text, text, text, timestamptz, timestamptz, integer, numeric, boolean) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.admin_disable_login_background_media(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.login_resolve_background_media(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_list_login_background_media() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_upsert_login_background_media(text, text, text, text, text, text, timestamptz, timestamptz, integer, numeric, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_disable_login_background_media(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.login_resolve_background_media(text) TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
