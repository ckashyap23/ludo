# Twisted Ludo

Twisted Ludo is a full-stack online Ludo game with account-based history, resumable multiplayer matches, live game updates over WebSockets, and a responsive React UI.

## What is in this repo

- `frontend/`: React + Vite + TypeScript + Tailwind client
- `backend/`: FastAPI + SQLAlchemy backend with WebSocket game updates
- `docs/`: product, structure, and implementation documentation
- `scripts/`: helper scripts and generated assets

## Current product features

- Landing page with a single central sign-in CTA for logged-out users
- Username/email/password authentication
- Create 2-player and 4-player games
- Join games via invite link or game id when logged out
- Live lobby with ready/start flow
- Real-time gameplay updates over WebSockets
- Pause and resume flow for multiplayer games
- `My Games` full-screen overlay with active, paused, completed, and aborted games
- Database-backed game persistence tied to signed-in users
- Responsive layouts for desktop and mobile browsers

## Tech stack

### Frontend

- React 18
- Vite 5
- TypeScript
- Tailwind CSS
- React Router DOM

### Backend

- FastAPI
- SQLAlchemy async
- PostgreSQL or SQLite
- `asyncpg` / `psycopg`
- JWT auth
- WebSockets

## Local development

### Prerequisites

- Node.js 18+
- Python 3.13 recommended for local backend work on Windows
- npm

### Backend setup

1. Create `backend/.env` from `backend/.env.example`
2. Update the database connection and JWT secret
3. Create a virtual environment and install dependencies

Windows PowerShell:

```powershell
cd backend
py -3.13 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8080 --reload
```

macOS / Linux:

```bash
cd backend
python3.13 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8080 --reload
```

### Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://127.0.0.1:5173` by default.

## Environment variables

Backend variables live in `backend/.env`.

Example:

```env
DATABASE_URL=postgresql+asyncpg://ludo_user:password@localhost:5432/ludo_db
DB_AUTO_CREATE=true
APP_ENV=development
JWT_SECRET=change-me-in-production
```

Important notes:

- If `DATABASE_URL` is not provided, the backend falls back to local SQLite.
- On Windows, the backend normalizes certain `postgresql+psycopg://` URLs to an async driver form for local development.
- `DB_AUTO_CREATE=true` allows SQLAlchemy to create missing tables on startup.

## Default local ports

- Frontend: `5173`
- Backend: `8080`

## Deployment notes

This repo already includes:

- `start.sh`
- `nixpacks.toml`
- `railway.json`

These files support backend deployment on platforms such as Railway and similar Nixpacks-based hosts.

Production recommendations:

- Use managed PostgreSQL
- Set a strong `JWT_SECRET`
- Do not commit `.env`
- Keep `APP_ENV=production` in hosted environments

## Before pushing to GitHub

Recommended checks:

1. Make sure `.env` files are not staged
2. Remove or ignore local runtime artifacts such as `backend/.venv/`, `backend/logs/`, and `frontend/node_modules/`
3. Verify the README matches the current product behavior
4. Confirm database credentials are not hardcoded anywhere in tracked files

Useful commands:

```bash
git status
git add .
git commit -m "Prepare repo for GitHub"
git remote add origin <your-github-repo-url>
git push -u origin main
```

## Documentation

- [Project Structure](docs/STRUCTURE.md)
- [Implementation Guide](docs/Implementation%20Guide.md)
- [Twisted Ludo PRD](docs/TwistedLudo%20PRD.md)
