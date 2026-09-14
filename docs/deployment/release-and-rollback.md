# Production release and rollback evidence

The production branch is `main`. A release is proven only when the deployed
frontend and backend both report the exact 40-character commit SHA selected for
the release. A green CI run or a provider deployment marked ready is not enough.

`docs/deployment/provider-contract.json` is the checked source of truth for
provider identity. Known Vercel identifiers are recorded exactly. Netlify
identifiers remain explicitly unverified until supplied through repository
variables; they must never be guessed or copied from another project.

The `Production release gate` workflow starts only after `CI` for a push to
`main` finishes successfully. It checks out that exact green SHA, polls the
Netlify and Vercel APIs for ready production deploys carrying the same SHA,
records immutable previous deploys as rollback targets, runs the readiness
canary and runtime SLO checks, and retains the evidence for 30 days. If a check
fails after discovery, the workflow re-fetches both providers' immutable
deployment records and dispatches both rollbacks only when every identity and
eligibility check passes. Failed or cancelled CI gets an explicit rejected
release-gate run.

Provider settings must keep `main` protected and must hold domain promotion
behind deployment checks if the account supports that feature. Without staged
promotion, this is a post-deploy verification gate and cannot prevent a
provider from briefly serving a bad build.

`Deployed canary` remains the manual recovery and rehearsal path. It accepts
immutable deploy IDs explicitly and applies the same exact-SHA and SLO checks.

Before enabling the automatic gate:

1. Apply `.github/branch-protection.json` to `develop` and `main` and enable
   automatic head-branch deletion from `.github/repository-settings.json`.
2. Configure the variables and secrets in the production operations runbook.
3. Enable provider previews with preview-scoped environment values.
4. Configure provider deployment checks for the required GitHub checks where
   the account supports staged promotion.
5. Run `Deployed canary` once against known current and rollback deploy IDs.

Manual rollback is authorized separately from validation. Use the immutable
rollback IDs in `deployment-discovery.json`; never use a branch name or mutable
alias. The automatic path records `rollback-evidence.json`. After both providers
report ready, run `Deployed canary` for the rollback SHA. An alias change alone
is not evidence of recovery.

`.github/branch-protection.json` records the desired protected-branch contract.
Applying it to GitHub is an external administrative change and is intentionally
outside these repository-only changes.
