# BIOTRIX Admin workspace

The `/admin` console is the entry point for existing HQ modules. Active
operators can open tasks, commerce, sourcing, procurement, finance, R&D,
growth, advisory, knowledge, Founder Room and AI Agents from one grouped
navigation. The public brand site and commerce preview are separate
deployments; they do not expose the HQ operator database or mailing drafts.
Owner-only account and mailing controls live at `/admin/settings`.

## Current operations

- Operator roles and active state use Supabase `admin_users`. Only the active
  owner can edit them. The current owner and last active owner cannot be disabled.
- Operator invitations require the server-only `SUPABASE_SERVICE_ROLE_KEY`
  environment variable. It must never be added to `NEXT_PUBLIC_*` or Git.
  Without it, the invite form is disabled.
- Customer accounts and their existing `marketing_consent` values are read
  from `customers`; the Admin does not create consent.
- Mail copy is saved to `mailing_drafts` as a draft. There is no send action,
  email service integration, unsubscribe workflow, or delivery tracking yet.
- Changes to operators and new drafts attempt to write `audit_logs`.

The SQL for this release is in
`supabase/migrations/20260927230434_admin_mailing_workspace.sql`. It has been
applied to the BIOTRIX Supabase project. Production must not run that SQL again.
Reconcile the manually applied script with the remote migration history before
using automated migration replay from this checkout.

## Release checks

Run `npm install` and `npm run build`. After deployment, sign in as an
active operator and check `/admin`. Non-owners should see the console but
cannot reach `/admin/settings`; anonymous visitors go to `/login`.
Create a test draft as Owner to verify database permission before inviting
an actual colleague.

The Work Queue still prepares prompts for external ChatGPT Work and accepts
pasted results. The Founder Room's automatic model execution requires its
existing AI runtime switch and gateway authentication. This console does not
claim to reproduce ChatGPT Work inside the website.
