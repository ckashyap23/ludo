"""WebSocket connection manager for broadcasting game events."""

from fastapi import WebSocket


class ConnectionManager:
    """Manages active WebSocket connections per game."""

    def __init__(self) -> None:
        # game_id -> {player_id -> WebSocket}
        self._connections: dict[str, dict[str, WebSocket]] = {}

    async def connect(self, game_id: str, player_id: str, websocket: WebSocket) -> None:
        await websocket.accept()
        if game_id not in self._connections:
            self._connections[game_id] = {}
        self._connections[game_id][player_id] = websocket

    def disconnect(self, game_id: str, player_id: str) -> None:
        if game_id in self._connections:
            self._connections[game_id].pop(player_id, None)
            if not self._connections[game_id]:
                del self._connections[game_id]

    async def broadcast(self, game_id: str, message: dict) -> None:
        """Send a message to all connected players in a game."""
        connections = self._connections.get(game_id, {})
        dead: list[str] = []
        for player_id, ws in connections.items():
            try:
                await ws.send_json(message)
            except Exception:
                dead.append(player_id)
        for player_id in dead:
            self.disconnect(game_id, player_id)

    async def broadcast_except(self, game_id: str, exclude_player_id: str, message: dict) -> None:
        """Send a message to all connected players except one."""
        connections = self._connections.get(game_id, {})
        dead: list[str] = []
        for player_id, ws in connections.items():
            if player_id == exclude_player_id:
                continue
            try:
                await ws.send_json(message)
            except Exception:
                dead.append(player_id)
        for player_id in dead:
            self.disconnect(game_id, player_id)

    async def send_to(self, game_id: str, player_id: str, message: dict) -> None:
        """Send a message to a specific player."""
        ws = self._connections.get(game_id, {}).get(player_id)
        if ws:
            try:
                await ws.send_json(message)
            except Exception:
                self.disconnect(game_id, player_id)


manager = ConnectionManager()
