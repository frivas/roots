BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA extensions;

SELECT plan(18);

INSERT INTO public.users (id, role)
VALUES
  ('user_1', 'parent'),
  ('user_2', 'teacher'),
  ('admin_1', 'admin');

INSERT INTO public.messages (id, sender_id, recipient_id, subject, body)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'user_1', 'user_2', 'Shared', 'Visible'),
  ('00000000-0000-0000-0000-000000000002', 'user_2', 'user_2', 'Private', 'Hidden');

SELECT ok(
  (SELECT bool_and(c.relrowsecurity)
   FROM pg_class c
   JOIN pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public'
     AND c.relname IN (
       'health_checks',
       'illustration_jobs',
       'messages',
       'notifications',
       'services',
       'settings',
       'users'
     )),
  'RLS is enabled on every exposed application table'
);

SELECT ok(
  NOT has_table_privilege('anon', 'public.users', 'SELECT'),
  'anon cannot read user profiles'
);

SELECT ok(
  has_table_privilege('anon', 'public.health_checks', 'SELECT'),
  'anon can read only the non-sensitive readiness row'
);

SET LOCAL ROLE authenticated;
SELECT set_config(
  'request.jwt.claims',
  '{"sub":"user_1","role":"authenticated"}',
  true
);

SELECT results_eq(
  $$SELECT id FROM public.users ORDER BY id$$,
  ARRAY['user_1']::text[],
  'Clerk subject can read only its own user row'
);

SELECT results_eq(
  $$SELECT id::text FROM public.messages ORDER BY id$$,
  ARRAY['00000000-0000-0000-0000-000000000001']::text[],
  'message RLS exposes only rows where the Clerk subject participates'
);

SELECT results_eq(
  $$UPDATE public.messages
    SET read = true
    WHERE id = '00000000-0000-0000-0000-000000000002'
    RETURNING id::text$$,
  ARRAY[]::text[],
  'a user cannot mutate another user message'
);

SELECT lives_ok(
  $$INSERT INTO public.settings (user_id, language)
    VALUES ('user_1', 'Spanish')$$,
  'a user can persist its own settings'
);

SELECT throws_ok(
  $$INSERT INTO public.settings (user_id, language)
    VALUES ('user_2', 'Spanish')$$,
  '42501',
  'new row violates row-level security policy for table "settings"',
  'a user cannot create another user settings row'
);

SELECT results_eq(
  $$SELECT id FROM public.get_or_create_current_user()$$,
  ARRAY['user_1']::text[],
  'the atomic current-user function returns only the Clerk subject'
);

SELECT results_eq(
  $$SELECT language FROM public.get_or_create_current_settings()$$,
  ARRAY['Spanish']::text[],
  'the atomic settings function returns existing current-user settings'
);

SELECT results_eq(
  $$SELECT language
    FROM public.upsert_current_settings(p_language => 'French')$$,
  ARRAY['French']::text[],
  'the atomic settings upsert applies a partial update'
);

SELECT results_eq(
  $$SELECT language
    FROM public.upsert_current_settings(p_reset => true)$$,
  ARRAY['English']::text[],
  'the atomic settings upsert resets defaults in one call'
);

SELECT set_config(
  'request.jwt.claims',
  '{"sub":"user_2","role":"authenticated"}',
  true
);

SELECT results_eq(
  $$SELECT user_id FROM public.get_or_create_current_settings()$$,
  ARRAY['user_2']::text[],
  'the atomic settings function remains scoped by RLS to the Clerk subject'
);

SELECT set_config(
  'request.jwt.claims',
  '{"sub":"user_1","role":"authenticated"}',
  true
);

SELECT throws_ok(
  $$INSERT INTO public.notifications (title, message, type, user_id)
    VALUES ('Cross-user', 'Denied', 'info', 'user_2')$$,
  '42501',
  'new row violates row-level security policy for table "notifications"',
  'a non-admin cannot create a cross-user notification'
);

SELECT is(
  (
    SELECT count(*)
    FROM public.enqueue_illustration_job(
      'user_1',
      'session_1',
      'turn_1',
      'A safe forest scene'
    )
  ),
  1::bigint,
  'the authenticated owner can enqueue an illustration job'
);

SELECT is(
  (
    SELECT count(*)
    FROM public.enqueue_illustration_job(
      'user_1',
      'session_1',
      'turn_1',
      'A safe forest scene'
    )
  ),
  1::bigint,
  'an idempotent retry returns the existing illustration job'
);

SELECT is(
  (
    SELECT count(*)
    FROM public.illustration_jobs
    WHERE owner_id = 'user_1' AND idempotency_key = 'turn_1'
  ),
  1::bigint,
  'idempotent retries create only one durable job row'
);

SELECT set_config(
  'request.jwt.claims',
  '{"sub":"admin_1","role":"authenticated"}',
  true
);

SELECT lives_ok(
  $$INSERT INTO public.notifications (title, message, type, user_id)
    VALUES ('Admin', 'Authorized', 'info', 'user_2')$$,
  'a server-controlled admin role can create a cross-user notification'
);

SELECT * FROM finish();

ROLLBACK;
