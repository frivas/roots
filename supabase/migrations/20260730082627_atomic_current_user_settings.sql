DROP INDEX IF EXISTS public.messages_recipient_created_idx;
DROP INDEX IF EXISTS public.messages_sender_created_idx;
DROP INDEX IF EXISTS public.notifications_user_created_idx;

CREATE INDEX messages_recipient_created_idx
  ON public.messages (recipient_id, created_at DESC, id DESC);
CREATE INDEX messages_sender_created_idx
  ON public.messages (sender_id, created_at DESC, id DESC);
CREATE INDEX notifications_user_created_idx
  ON public.notifications (user_id, created_at DESC, id DESC);

CREATE OR REPLACE FUNCTION public.get_or_create_current_user()
RETURNS SETOF public.users
LANGUAGE sql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
  INSERT INTO public.users (id)
  VALUES ((SELECT auth.jwt()) ->> 'sub')
  ON CONFLICT (id) DO UPDATE
  SET updated_at = public.users.updated_at
  RETURNING public.users.*;
$$;

CREATE OR REPLACE FUNCTION public.get_or_create_current_settings()
RETURNS SETOF public.settings
LANGUAGE sql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
  INSERT INTO public.settings (user_id)
  VALUES ((SELECT auth.jwt()) ->> 'sub')
  ON CONFLICT (user_id) DO UPDATE
  SET updated_at = public.settings.updated_at
  RETURNING public.settings.*;
$$;

CREATE OR REPLACE FUNCTION public.upsert_current_settings(
  p_email_notifications boolean DEFAULT NULL,
  p_sms_notifications boolean DEFAULT NULL,
  p_push_notifications boolean DEFAULT NULL,
  p_language text DEFAULT NULL,
  p_timezone text DEFAULT NULL,
  p_reset boolean DEFAULT false
)
RETURNS SETOF public.settings
LANGUAGE sql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
  INSERT INTO public.settings (
    user_id,
    email_notifications,
    sms_notifications,
    push_notifications,
    language,
    timezone
  )
  VALUES (
    (SELECT auth.jwt()) ->> 'sub',
    COALESCE(p_email_notifications, true),
    COALESCE(p_sms_notifications, false),
    COALESCE(p_push_notifications, false),
    COALESCE(p_language, 'English'),
    COALESCE(p_timezone, 'UTC')
  )
  ON CONFLICT (user_id) DO UPDATE
  SET
    email_notifications = CASE
      WHEN p_reset THEN true
      ELSE COALESCE(p_email_notifications, public.settings.email_notifications)
    END,
    sms_notifications = CASE
      WHEN p_reset THEN false
      ELSE COALESCE(p_sms_notifications, public.settings.sms_notifications)
    END,
    push_notifications = CASE
      WHEN p_reset THEN false
      ELSE COALESCE(p_push_notifications, public.settings.push_notifications)
    END,
    language = CASE
      WHEN p_reset THEN 'English'
      ELSE COALESCE(p_language, public.settings.language)
    END,
    timezone = CASE
      WHEN p_reset THEN 'UTC'
      ELSE COALESCE(p_timezone, public.settings.timezone)
    END,
    updated_at = now()
  RETURNING public.settings.*;
$$;

REVOKE ALL ON FUNCTION public.get_or_create_current_user()
  FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_or_create_current_settings()
  FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.upsert_current_settings(
  boolean,
  boolean,
  boolean,
  text,
  text,
  boolean
) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.get_or_create_current_user()
  TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_or_create_current_settings()
  TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.upsert_current_settings(
  boolean,
  boolean,
  boolean,
  text,
  text,
  boolean
) TO authenticated, service_role;
