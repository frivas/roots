# Backend operating modes

`ROOTS_BACKEND_MODE` defaults to `demo`. Demo mode authenticates requests but
does not connect to Supabase or OpenAI. Data reads return empty or neutral
defaults, and every mutation or illustration request returns HTTP 503 with
`DEMO_MODE_UNAVAILABLE`. Responses include `x-roots-mode: demo`.

`ROOTS_BACKEND_MODE=connected` enables the existing Supabase and OpenAI path.
Do not enable it for a release until all of the following external controls are
verified in the target environment:

- Clerk-issued Supabase tokens and row-level policies enforce the documented
  user, family, teacher, and administrator boundaries.
- The shared illustration-job schema and storage are deployed and verified
  across separate serverless instances. OpenAI URLs alone are temporary.
- Rate limiting uses a shared serverless-compatible store. The built-in limiter
  is only a local safety limit per process.
- Error-rate alerting, an uptime monitor, and log retention/redaction are
  configured in the hosting platform. Application logs are structured and
  redact credentials, but platform retention and alerts are external controls.
- Foreign-key query indexes are present and verified with representative query
  plans before persistent traffic is enabled.

`GET /health` is process liveness. `GET /ready` reports the active mode and the
state of dependencies used in that mode. `configured` means credentials are
present; it does not claim a successful remote provider call.
