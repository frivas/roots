# Production release and rollback evidence

The production branch is `main`. A release is proven only when the deployed
frontend and backend both report the exact 40-character commit SHA selected for
the release. A green CI run or a provider deployment marked ready is not enough.

`docs/deployment/provider-contract.json` is the checked source of truth for
provider identity. Known Vercel identifiers are recorded exactly. Netlify
identifiers remain explicitly unverified until supplied through repository
variables; they must never be guessed or copied from another project.

The `Deployed canary` workflow is read-only. It does not create deployments,
change aliases, or execute a rollback. It validates the supplied provider
identifiers, proves the frontend `release.json` SHA, checks the frontend and
backend health endpoints, and uploads an exact-SHA evidence artifact.

Before promoting a release:

1. Record the immutable current and previous deploy IDs for both providers.
2. Set every required variable listed in the provider contract.
3. Run the canary for the exact candidate SHA.
4. Retain the generated `release-evidence.json` with the release record.

A rollback is authorized separately from validation. The rollback target must
be an immutable deploy ID different from the current deploy ID, and its commit
SHA must already be known. After a provider rollback, rerun the canary using the
rollback target SHA and IDs. Do not infer rollback success from an alias change.

`.github/branch-protection.json` records the desired protected-branch contract.
Applying it to GitHub is an external administrative change and is intentionally
outside these repository-only changes.
