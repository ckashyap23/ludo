# Implementation Guide

This guide explains how Twisted Ludo is implemented today so the codebase is easier to maintain, extend, and deploy.

## 1. Product overview

Twisted Ludo is an online multiplayer Ludo app with:

- account-based sign-in and sign-up
- resumable multiplayer sessions
- real-time game updates with WebSockets
- persistent game history tied to users
- responsive desktop and mobile layouts

Core user flows:

1. A signed-out user lands on the home page and can sign in or join by game link.
2. A signed-in user can create a new 2-player or 4-player game.
3. Players join a lobby and click Start.
4. Once all required players are ready, the game becomes active.
5. Active games can be paused and later resumed.
6. `My Games` shows live, paused, completed, and aborted games tied to the user.

## 2. Frontend architecture

### 2.1 App shell and pages

Primary files:

- `frontend/src/App.tsx`
- `frontend/src/pages/HomePage.tsx`
- `frontend/src/pages/GamePage.tsx`

Responsibilities:

- `HomePage.tsx`
  - central sign-in button for logged-out users
  - create-game actions for signed-in users
  - top-right `My Games` and `Sign Out`
  - full-screen `My Games` overlay
- `GamePage.tsx`
  - lobby state
  - active game state
  - pause / resume / reset actions
  - board, dice, and player panel composition

### 2.2 Auth state

Primary file:

- `frontend/src/context/AuthContext.tsx`

Frontend auth responsibilities:

- store JWT token in client state/storage
- expose current user and login/logout methods
- attach token to authenticated API calls

### 2.3 API layer

Primary file:

- `frontend/src/api/client.ts`

Responsibilities:

- REST calls for auth and game actions
- token-aware headers
- player-id headers for game actions
- base URL and WebSocket URL helpers

Current frontend expectation:

- backend is available on port `8080` locally unless `VITE_API_BASE_URL` overrides it

### 2.4 Local player identity

Primary file:

- `frontend/src/hooks/usePlayerIdentity.ts`

Why it exists:

- stores per-game player identity in the browser
- lets a returning browser reconnect to the same game slot
- helps the app claim existing game sessions into account history

### 2.5 Real-time updates

Primary file:

- `frontend/src/hooks/useGameSocket.ts`

Responsibilities:

- connect to the backend WebSocket for a specific game and player
- receive lobby updates, game updates, reset events, and pause/resume state
- keep the React UI in sync without polling

### 2.6 Main gameplay UI

Primary files:

- `frontend/src/components/Board.tsx`
- `frontend/src/components/Dice.tsx`
- `frontend/src/components/PlayerPanel.tsx`
- `frontend/src/components/LobbyView.tsx`
- `frontend/src/components/MyGames.tsx`

Notes:

- `Board.tsx` renders the 15x15 board and token overlays.
- `Dice.tsx` contains the primary rolling action and smaller game control buttons.
- `PlayerPanel.tsx` shows the current players and turn highlighting.
- `LobbyView.tsx` handles the pre-game waiting room.
- `MyGames.tsx` renders a table of user games with action buttons.

## 3. Backend architecture

### 3.1 App startup

Primary file:

- `backend/app/main.py`

Responsibilities:

- configure FastAPI
- set Windows event-loop compatibility for local async driver behavior
- create database tables on startup
- register CORS
- mount `health`, `games`, and `auth` routers

### 3.2 Configuration and database

Primary files:

- `backend/app/core/config.py`
- `backend/app/core/database.py`

Current behavior:

- `DATABASE_URL` drives persistence
- default fallback is local SQLite
- `DB_AUTO_CREATE` controls startup table creation
- `APP_ENV` distinguishes development vs production intent
- on Windows, certain Postgres URLs are normalized for async local development

### 3.3 Authentication

Primary files:

- `backend/app/api/routes/auth.py`
- `backend/app/services/auth_service.py`
- `backend/app/models/user.py`
- `backend/app/schemas/auth.py`

Implemented auth features:

- register
- login
- current user endpoint
- JWT token creation and validation
- hashed password verification

The current persisted user model includes:

- `id`
- `username`
- `email`
- `hashed_password`

### 3.4 Game transport and live state

Primary files:

- `backend/app/api/routes/games.py`
- `backend/app/services/connection_manager.py`

Current design:

- live lobbies are stored in an in-memory `_lobbies` map
- WebSockets fan out lobby and game-state updates to connected players
- player records in memory can also carry authenticated `user_id` bindings

Important statuses in practice:

- `waiting`
- `active`
- `paused`
- `finished` in memory, persisted as `completed`
- `aborted`

### 3.5 Game persistence

Primary files:

- `backend/app/models/game.py`
- `backend/app/api/routes/games.py`
- `backend/app/api/routes/auth.py`

Current persistence model:

- one persisted row per `game_id`
- user ids can be attached to player slots 1-4
- winner user id and winner display name are stored when available
- engine state is serialized for persistence

Persisted game fields include:

- `game_id`
- `player_count`
- `status`
- `player_one_user_id` through `player_four_user_id`
- `player_one_display_name` through `player_four_display_name`
- `winner_user_id`
- `winner_display_name`
- `engine_state_json`
- `created_at`
- `ended_at`

How `My Games` works:

- the backend reads persisted games linked to the current user
- then merges currently live in-memory lobbies for that same user
- the frontend displays the combined result as a table

## 4. Gameplay flow

### 4.1 Game creation and join

Routes:

- `POST /games`
- `POST /games/{game_id}/join`

Behavior:

- creator becomes player 1
- subsequent players join available slots
- signed-in users send auth tokens so their user ids can be attached to the lobby and persisted game record

### 4.2 Lobby and ready flow

Route:

- `POST /games/{game_id}/ready`

Behavior:

- players join a lobby
- once all required players are ready, the game engine state is initialized
- game status changes from `waiting` to `active`

### 4.3 Active game actions

Representative routes:

- `GET /games/{game_id}`
- `POST /games/{game_id}/roll`
- `POST /games/{game_id}/move`
- `POST /games/{game_id}/pass`
- `POST /games/{game_id}/pause`
- `POST /games/{game_id}/resume`
- `POST /games/{game_id}/reset`
- `POST /games/{game_id}/claim`

Frontend behavior:

- board shows movable token choices
- dice panel highlights the primary roll action for the active player
- pause and reset live beside the dice controls

### 4.4 Pause and resume

Current UX:

- any active player can pause the match
- paused games appear in `My Games`
- resuming requires all relevant players to click Resume
- the paused overlay and `My Games` both surface the resume path

### 4.5 My Games

Current UX:

- full-screen overlay from the home page
- sticky top bar with `Close`
- table layout with:
  - status
  - game id
  - players
  - winner
  - created date
  - action button

Action behavior:

- active/waiting games show `Open Game`
- paused games show `Resume Game`
- completed and aborted games are listed without a resume/open action

## 5. Board implementation summary

Primary file:

- `frontend/src/components/Board.tsx`

Implementation details:

- fixed 15x15 logical board grid
- numbered outer path positions
- color yards and home lanes mapped to fixed cells
- tokens rendered as absolute overlays on top of board cells
- winner banner and rolling die animation layered on top of the board

## 6. Deployment model

Deployment helper files:

- `start.sh`
- `nixpacks.toml`
- `railway.json`

Current backend deployment expectation:

- a platform starts `start.sh`
- the script launches the FastAPI app from `backend/`
- `PORT` comes from the hosting platform

Recommended production setup:

- `APP_ENV=production`
- managed PostgreSQL
- strong JWT secret
- frontend served separately or via a static host

## 7. Local development guide

### Backend

Windows PowerShell:

```powershell
cd backend
py -3.13 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8080 --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Local URLs

- frontend: `http://127.0.0.1:5173`
- backend: `http://127.0.0.1:8080`
- backend docs: `http://127.0.0.1:8080/docs`

## 8. GitHub push checklist

Before pushing publicly:

1. confirm no secrets are present in tracked files
2. confirm `backend/.env` is ignored and not staged
3. confirm local DB files and logs are not intentionally committed unless desired
4. review README screenshots or examples if you plan to add them
5. verify the docs reflect the current product state

## 9. Recommended next improvements

- add formal DB migrations instead of relying on startup table creation
- tighten production CORS around `APP_ENV`
- add automated backend tests for pause/resume and persistence
- add frontend smoke tests for login, create game, and `My Games`
- decide whether the hidden `Chance` mechanic should be removed entirely from the backend rules
