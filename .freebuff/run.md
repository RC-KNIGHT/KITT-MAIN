# Running the KITT dev server (this thread's workspace)

Workspace: `C:\Users\om\OneDrive\Desktop\KITT-MAIN`
Default URL: `http://localhost:3000` (port from `vite.config.ts` / `PORT` env; the Express server in `server.ts` hosts Vite in middleware mode)

## 1. Reproduce uncommitted artifacts

- No `.env.local` exists in the main checkout — only the tracked `.env.example`. If one is ever added to the main checkout, copy it here (copy, never symlink; adapt `PORT` per worktree if needed):
  `copy C:\Users\om\OneDrive\Desktop\KITT-MAIN\.env.local C:\Users\om\OneDrive\Desktop\KITT-MAIN\.env.local`
  (In a separate worktree, copy from the main checkout path above.)
- Install dependencies with npm (lockfile is `package-lock.json`):
  `npm ci`

## 2. Run the server

Detached start (Windows/PowerShell) — stdout and stderr go to different files:

```
powershell -NoProfile -Command "(Start-Process -FilePath 'npm.cmd' -ArgumentList 'run','dev' -RedirectStandardOutput '.freebuff\preview-284b1fe5-32aa-4d49-9b9f-9480178f4202.log' -RedirectStandardError '.freebuff\preview-284b1fe5-32aa-4d49-9b9f-9480178f4202.log.err' -WindowStyle Hidden -PassThru).Id"
```

Then confirm the pid survives (`powershell -NoProfile -Command "Get-Process -Id <pid>"`) and wait until `http://localhost:3000` answers.

To use a different port, set `PORT` in `.env.local` (the Express server reads it; `vite.config.ts` port is 3000 — keep them aligned).

Stop: `taskkill /PID <pid> /T` (kills the npm/tsx child tree).
