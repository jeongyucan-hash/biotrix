# BIOTRIX AI Node Fleet

## Target topology

- GitHub: configuration source of truth
- Vercel / BIOTRIX HQ: control plane and web application
- Shared knowledge/memory: HQ + OpenViking integration target
- Work PC: worker node, role `work`
- Home PC: worker node, role `home`

Each Windows node receives the same agent stack but owns a local UUID in `%USERPROFILE%\.biotrix\node.json`.

## First install

On the work PC, after obtaining the repository:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install-biotrix-node.ps1 -Role work
```

On the home PC:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install-biotrix-node.ps1 -Role home
```

## Updates

Manual:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\update-biotrix-node.ps1
```

Optional daily update task:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\register-biotrix-update-task.ps1 -Time "09:00"
```

The scheduled task runs only when that Windows machine is available. It does not remotely power on a PC.

## What syncs

Git-synced:
- bootstrap scripts
- agent instructions
- skill installation definitions
- MCP configuration instructions
- design and QA rules
- HQ source code

Not Git-synced:
- API keys
- OAuth sessions
- browser profiles/cookies
- machine credentials
- local memory database contents

## Shared brain direction

Do not copy local AgentMemory database files between machines. The durable cross-device layer should be an authenticated cloud context service. BIOTRIX HQ/OpenViking integration is the target shared knowledge layer; local AgentMemory remains a fast per-node memory/cache until server synchronization is explicitly implemented and tested.

## Security

Company data must follow employer policy. Do not place company secrets, credentials, patient information, unpublished confidential material, or proprietary documents into external AI services without authorization.
