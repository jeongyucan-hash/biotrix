# BIOTRIX Cloud Workspace

Created: 2026-10-02

This branch is a safe cross-device workspace map. It does not alter the existing production or preview deployment branches.

## Primary working branches
- Public site: `preview/biotrix-science-20261001`
- HQ: `hq-nextjs`
- Commerce: `commerce-nextjs`

All other current branches and their exact head commit SHAs are recorded in `sync-manifest.json`.

## Data
BIOTRIX operational data is already cloud-hosted in Supabase:
- project ref: `qmhqdjxmpatncobkozkr`
- region: `ap-northeast-2`
- URL: `https://qmhqdjxmpatncobkozkr.supabase.co`

The database is active and contains HQ/commerce operational data. Real secret keys are intentionally not stored in Git.

## Known Vercel project contexts
- `biotrix-vercel-ready`
- `biotrix-hq`
- `biotrix-commerce`
- legacy/secondary: `biotrix-k28g`, `biotrix`

## New-PC restore
Clone the repository, fetch all branches, and checkout the working branch you need. Install dependencies for Next.js branches and recreate `.env.local` from authorized cloud environment values.

## Important
This repository already contains the cloud copy of the known BIOTRIX work. The only remaining category that cannot be recovered from GitHub is an uncommitted/untracked file that still exists only on the current PC. That must be detected and pushed from the local working copy.
