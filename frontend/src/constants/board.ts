import type { PlayerColor } from "../types/game";

export const START_PATH_INDEX: Record<PlayerColor, number> = {
  green: 0,
  yellow: 13,
  blue: 26,
  red: 39,
};

export const START_PATH_INDEX_SET = new Set(Object.values(START_PATH_INDEX));
