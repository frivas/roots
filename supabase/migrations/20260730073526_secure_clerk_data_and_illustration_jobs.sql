-- Adopt Clerk's native Supabase third-party-auth subject as the ownership key.
-- Clerk subjects are strings (for example, user_...), so auth.uid() UUID
-- policies cannot represent them.

DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Users can read their messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can read own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can read own settings" ON public.settings;
DROP POLICY IF EXISTS "Users can update own settings" ON public.settings;
DROP POLICY IF EXISTS "Anyone can read services" ON public.services;

ALTER TABLE public.messages
  DROP CONSTRAINT IF EXISTS messages_sender_id_fkey,
  DROP CONSTRAINT IF EXISTS messages_recipient_id_fkey;
ALTER TABLE public.notifications
  DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE public.settings
  DROP CONSTRAINT IF EXISTS settings_user_id_fkey;

ALTER TABLE public.users
  ALTER COLUMN id TYPE text USING id::text,
  ALTER COLUMN email DROP NOT NULL;
ALTER TABLE public.messages
  ALTER COLUMN sender_id TYPE text USING sender_id::text,
  ALTER COLUMN recipient_id TYPE text USING recipient_id::text;
ALTER TABLE public.notifications
  ALTER COLUMN user_id TYPE text USING user_id::text;
ALTER TABLE public.settings
  ALTER COLUMN user_id TYPE text USING user_id::text;
ALTER TABLE public.services
  ALTER COLUMN id TYPE text USING id::text;

UPDATE public.users
SET role = CASE
  WHEN lower(role) IN ('admin', 'parent', 'student', 'teacher', 'user')
    THEN lower(role)
  ELSE 'user'
END;

ALTER TABLE public.messages
  ADD CONSTRAINT messages_sender_id_fkey
    FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE NOT VALID,
  ADD CONSTRAINT messages_recipient_id_fkey
    FOREIGN KEY (recipient_id) REFERENCES public.users(id) ON DELETE CASCADE NOT VALID;
ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE NOT VALID;
ALTER TABLE public.settings
  ADD CONSTRAINT settings_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE NOT VALID;

ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_role_check,
  ALTER COLUMN role SET DEFAULT 'user',
  ADD CONSTRAINT users_role_check
    CHECK (role IN ('admin', 'parent', 'student', 'teacher', 'user'));
ALTER TABLE public.notifications
  DROP CONSTRAINT IF EXISTS notifications_type_check,
  ADD CONSTRAINT notifications_type_check
    CHECK (type IN ('error', 'info', 'success', 'warning'));

CREATE INDEX IF NOT EXISTS messages_recipient_created_idx
  ON public.messages (recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS messages_sender_created_idx
  ON public.messages (sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_user_created_idx
  ON public.notifications (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_unread_user_created_idx
  ON public.notifications (user_id, created_at DESC)
  WHERE read = false;
CREATE INDEX IF NOT EXISTS users_role_idx
  ON public.users (role);

CREATE TABLE public.illustration_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id text NOT NULL,
  session_id text NOT NULL,
  idempotency_key text NOT NULL,
  prompt text NOT NULL CHECK (char_length(prompt) BETWEEN 1 AND 4000),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('completed', 'failed', 'pending', 'processing')),
  image_url text,
  error_code text,
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts BETWEEN 0 AND 3),
  locked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT illustration_jobs_owner_idempotency_key
    UNIQUE (owner_id, idempotency_key)
);

ALTER TABLE public.illustration_jobs ENABLE ROW LEVEL SECURITY;

CREATE INDEX illustration_jobs_owner_created_idx
  ON public.illustration_jobs (owner_id, created_at DESC);
CREATE INDEX illustration_jobs_owner_session_created_idx
  ON public.illustration_jobs (owner_id, session_id, created_at DESC);
CREATE INDEX illustration_jobs_pending_created_idx
  ON public.illustration_jobs (created_at)
  WHERE status = 'pending';

CREATE TABLE public.health_checks (
  id smallint PRIMARY KEY CHECK (id = 1),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.health_checks (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.health_checks ENABLE ROW LEVEL SECURITY;

INSERT INTO public.services (id, name, description, is_active)
VALUES
  ('classroom', 'Classroom Management', 'Manage classroom activities and attendance', true),
  ('transportation', 'Transportation', 'Track school transportation routes and schedules', true),
  ('cafeteria', 'Cafeteria Services', 'Meal planning and cafeteria service management', true),
  ('extracurricular', 'Extracurricular Activities', 'Register and manage after-school programs', true),
  ('language', 'Language Support', 'Language assistance programs for students', true),
  ('mentorship', 'Mentorship Program', 'Connect with mentors and manage mentorship relationships', true),
  ('storytelling', 'Storytelling', 'Interactive child-safe storytelling and illustration', true)
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- Least-privilege Data API grants. RLS still determines row visibility.
REVOKE ALL ON TABLE
  public.users,
  public.messages,
  public.notifications,
  public.settings,
  public.services,
  public.illustration_jobs,
  public.health_checks
FROM anon, authenticated;

GRANT SELECT ON public.users TO authenticated;
GRANT INSERT (id, email, first_name, last_name, department)
  ON public.users TO authenticated;
GRANT UPDATE (email, first_name, last_name, department, updated_at)
  ON public.users TO authenticated;

GRANT SELECT ON public.messages TO authenticated;
GRANT INSERT (subject, body, sender_id, recipient_id)
  ON public.messages TO authenticated;
GRANT UPDATE (read, starred) ON public.messages TO authenticated;
GRANT DELETE ON public.messages TO authenticated;

GRANT SELECT ON public.notifications TO authenticated;
GRANT INSERT (title, message, type, user_id)
  ON public.notifications TO authenticated;
GRANT UPDATE (read) ON public.notifications TO authenticated;

GRANT SELECT ON public.settings TO authenticated;
GRANT INSERT (
  email_notifications,
  sms_notifications,
  push_notifications,
  language,
  timezone,
  user_id
) ON public.settings TO authenticated;
GRANT UPDATE (
  email_notifications,
  sms_notifications,
  push_notifications,
  language,
  timezone,
  updated_at
) ON public.settings TO authenticated;

GRANT SELECT ON public.services TO authenticated;

GRANT SELECT ON public.illustration_jobs TO authenticated;
GRANT INSERT (owner_id, session_id, idempotency_key, prompt)
  ON public.illustration_jobs TO authenticated;
GRANT UPDATE (
  status,
  image_url,
  error_code,
  attempts,
  locked_at,
  updated_at
) ON public.illustration_jobs TO authenticated;

GRANT SELECT ON public.health_checks TO anon, authenticated;

CREATE POLICY users_select_own
  ON public.users
  FOR SELECT
  TO authenticated
  USING (((select auth.jwt()) ->> 'sub') = id);

CREATE POLICY users_insert_own
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (((select auth.jwt()) ->> 'sub') = id);

CREATE POLICY users_update_own
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (((select auth.jwt()) ->> 'sub') = id)
  WITH CHECK (((select auth.jwt()) ->> 'sub') = id);

CREATE POLICY messages_select_participant
  ON public.messages
  FOR SELECT
  TO authenticated
  USING (
    ((select auth.jwt()) ->> 'sub') = sender_id
    OR ((select auth.jwt()) ->> 'sub') = recipient_id
  );

CREATE POLICY messages_insert_sender
  ON public.messages
  FOR INSERT
  TO authenticated
  WITH CHECK (((select auth.jwt()) ->> 'sub') = sender_id);

CREATE POLICY messages_update_participant
  ON public.messages
  FOR UPDATE
  TO authenticated
  USING (
    ((select auth.jwt()) ->> 'sub') = sender_id
    OR ((select auth.jwt()) ->> 'sub') = recipient_id
  )
  WITH CHECK (
    ((select auth.jwt()) ->> 'sub') = sender_id
    OR ((select auth.jwt()) ->> 'sub') = recipient_id
  );

CREATE POLICY messages_delete_participant
  ON public.messages
  FOR DELETE
  TO authenticated
  USING (
    ((select auth.jwt()) ->> 'sub') = sender_id
    OR ((select auth.jwt()) ->> 'sub') = recipient_id
  );

CREATE POLICY notifications_select_own
  ON public.notifications
  FOR SELECT
  TO authenticated
  USING (((select auth.jwt()) ->> 'sub') = user_id);

CREATE POLICY notifications_insert_own_or_admin
  ON public.notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    ((select auth.jwt()) ->> 'sub') = user_id
    OR EXISTS (
      SELECT 1
      FROM public.users actor
      WHERE actor.id = ((select auth.jwt()) ->> 'sub')
        AND actor.role = 'admin'
    )
  );

CREATE POLICY notifications_update_own
  ON public.notifications
  FOR UPDATE
  TO authenticated
  USING (((select auth.jwt()) ->> 'sub') = user_id)
  WITH CHECK (((select auth.jwt()) ->> 'sub') = user_id);

CREATE POLICY settings_select_own
  ON public.settings
  FOR SELECT
  TO authenticated
  USING (((select auth.jwt()) ->> 'sub') = user_id);

CREATE POLICY settings_insert_own
  ON public.settings
  FOR INSERT
  TO authenticated
  WITH CHECK (((select auth.jwt()) ->> 'sub') = user_id);

CREATE POLICY settings_update_own
  ON public.settings
  FOR UPDATE
  TO authenticated
  USING (((select auth.jwt()) ->> 'sub') = user_id)
  WITH CHECK (((select auth.jwt()) ->> 'sub') = user_id);

CREATE POLICY services_select_authenticated
  ON public.services
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY illustration_jobs_select_own
  ON public.illustration_jobs
  FOR SELECT
  TO authenticated
  USING (((select auth.jwt()) ->> 'sub') = owner_id);

CREATE POLICY illustration_jobs_insert_own
  ON public.illustration_jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (((select auth.jwt()) ->> 'sub') = owner_id);

CREATE POLICY illustration_jobs_update_own
  ON public.illustration_jobs
  FOR UPDATE
  TO authenticated
  USING (((select auth.jwt()) ->> 'sub') = owner_id)
  WITH CHECK (((select auth.jwt()) ->> 'sub') = owner_id);

CREATE POLICY health_checks_read
  ON public.health_checks
  FOR SELECT
  TO anon, authenticated
  USING (id = 1);

CREATE OR REPLACE FUNCTION public.enqueue_illustration_job(
  p_owner_id text,
  p_session_id text,
  p_idempotency_key text,
  p_prompt text
)
RETURNS SETOF public.illustration_jobs
LANGUAGE sql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
  INSERT INTO public.illustration_jobs (
    owner_id,
    session_id,
    idempotency_key,
    prompt
  )
  VALUES (
    p_owner_id,
    p_session_id,
    p_idempotency_key,
    p_prompt
  )
  ON CONFLICT (owner_id, idempotency_key) DO UPDATE
  SET updated_at = public.illustration_jobs.updated_at
  RETURNING public.illustration_jobs.*;
$$;

REVOKE ALL ON FUNCTION public.enqueue_illustration_job(text, text, text, text)
  FROM PUBLIC, anon;
GRANT EXECUTE
  ON FUNCTION public.enqueue_illustration_job(text, text, text, text)
  TO authenticated, service_role;
