# Project Structure

This document describes the current repository layout for Twisted Ludo.

## Top level

```text
.
|- backend/
|- docs/
|- frontend/
|- scripts/
|- .gitignore
|- nixpacks.toml
|- railway.json
|- README.md
|- start.sh
```

## Backend

```text
backend/
|- app/
|  |- api/
|  |  |- routes/
|  |  |  |- auth.py
|  |  |  |- games.py
|  |  |  |- health.py
|  |- core/
|  |  |- config.py
|  |  |- database.py
|  |- models/
|  |  |- game.py
|  |  |- game_record.py
|  |  |- player.py
|  |  |- user.py
|  |- schemas/
|  |  |- auth.py
|  |  |- game.py
|  |  |- player.py
|  |- services/
|  |  |- auth_service.py
|  |  |- connection_manager.py
|  |  |- game_engine.py
|  |- main.py
|- tests/
|- .env.example
|- requirements.txt
```

### Important backend files

- `backend/app/main.py`: FastAPI app setup, CORS, and startup table creation.
- `backend/app/api/routes/auth.py`: register, login, current-user, and `My Games` APIs.
- `backend/app/api/routes/games.py`: create/join/ready/roll/move/pass/pause/resume/reset APIs plus WebSocket handling.
- `backend/app/core/config.py`: environment-driven settings, DB URL normalization, and app mode.
- `backend/app/core/database.py`: SQLAlchemy engine, session, and declarative base.
- `backend/app/models/user.py`: persisted users table.
- `backend/app/models/game.py`: persisted games table with user linkage and game status.
- `backend/app/services/game_engine.py`: Ludo rules engine and game state transitions.
- `backend/app/services/connection_manager.py`: active WebSocket connection registry.
- `backend/app/services/auth_service.py`: JWT and password helpers.

### Backend notes

- Live lobbies still exist in memory while a game is active.
- Important game state is also persisted to the database for `My Games` and recovery.
- Local development may use SQLite or PostgreSQL.
- Hosted environments should use PostgreSQL.

## Frontend

```text
frontend/
|- public/
|- src/
|  |- api/
|  |  |- client.ts
|  |- components/
|  |  |- AuthModal.tsx
|  |  |- Board.tsx
|  |  |- Dice.tsx
|  |  |- LobbyView.tsx
|  |  |- MyGames.tsx
|  |  |- PlayerPanel.tsx
|  |  |- Token.tsx
|  |- constants/
|  |  |- board.ts
|  |- context/
|  |  |- AuthContext.tsx
|  |- hooks/
|  |  |- useGameSocket.ts
|  |  |- usePlayerIdentity.ts
|  |- pages/
|  |  |- GamePage.tsx
|  |  |- HomePage.tsx
|  |- types/
|  |  |- game.ts
|  |- App.tsx
|  |- ErrorBoundary.tsx
|  |- index.css
|  |- main.tsx
|- index.html
|- package.json
|- postcss.config.cjs
|- tailwind.config.cjs
|- tsconfig.json
|- vite.config.ts
```

### Important frontend files

- `frontend/src/App.tsx`: top-level app routing shell.
- `frontend/src/pages/HomePage.tsx`: landing page, auth entry, create-game flow, and `My Games` overlay.
- `frontend/src/pages/GamePage.tsx`: lobby state, active game state, pause/resume/reset controls, and gameplay screen.
- `frontend/src/components/Board.tsx`: board rendering and token interaction layer.
- `frontend/src/components/Dice.tsx`: dice actions and current turn UI.
- `frontend/src/components/LobbyView.tsx`: waiting room and ready/start flow.
- `frontend/src/components/MyGames.tsx`: full-page table view for persisted and live games.
- `frontend/src/context/AuthContext.tsx`: frontend auth state.
- `frontend/src/hooks/useGameSocket.ts`: real-time game updates over WebSocket.
- `frontend/src/hooks/usePlayerIdentity.ts`: local browser identity storage for a joined game.
- `frontend/src/api/client.ts`: REST and WebSocket URL helpers.

## Docs

```text
docs/
|- Implementation Guide.md
|- STRUCTURE.md
|- TwistedLudo PRD.md
|- ludo_board_numbered.svg
```

### Docs purpose

- `docs/Implementation Guide.md`: technical overview of how the app works today.
- `docs/STRUCTURE.md`: repo map and file responsibilities.
- `docs/TwistedLudo PRD.md`: product requirements and feature intent.

## Files that should not be pushed accidentally

These are usually local-only and should stay out of GitHub commits:

- `backend/.env`
- `backend/.venv/`
- `backend/logs/`
- `frontend/node_modules/`
- local SQLite database files if not intentionally tracked

## Runtime and deployment helpers

- `start.sh`: backend startup command for deployment.
- `nixpacks.toml`: Nixpacks build instructions.
- `railway.json`: Railway deployment configuration.
