# Local-to-Cloud Sync

## Purpose
These scripts finish the last part of the cross-device migration: detecting BIOTRIX work that exists only on a Windows PC and backing it up to GitHub without uploading common secret files, local databases, build outputs, or caches.

## Current-PC sync
Run `scripts/SYNC_LOCAL_NOW.ps1` from PowerShell.

What it does:
1. Finds the local clone whose `origin` is `jeongyucan-hash/biotrix`.
2. Fetches the latest remote state.
3. Detects tracked modifications and untracked files.
4. Creates a separate timestamped `backup/local-...` branch.
5. Stages tracked changes.
6. Adds untracked files only after excluding likely secrets, local DBs, build artifacts, and caches.
7. Commits and pushes the snapshot.

It deliberately does **not** merge anything into `main`, `hq-nextjs`, `commerce-nextjs`, or the public-site preview branch.

## New-PC restore
Run `scripts/RESTORE_NEW_PC.ps1`.

It clones/fetches the repository and shows the three primary working branches. Environment secrets must be restored separately from the authorized cloud environment.

## Important limitation
A file that is skipped as potentially sensitive remains only on the local PC until it is reviewed. The sync script prints every skipped path.
