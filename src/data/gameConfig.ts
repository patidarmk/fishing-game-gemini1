// Tweak these values to change game difficulty and feel

export const GAME_CONFIG = {
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,
  GAME_DURATION_S: 60, // seconds
};

export const HOOK_CONFIG = {
  WIDTH: 10,
  HEIGHT: 15,
  DROP_SPEED: 5,
  REEL_SPEED: 7,
  START_X: GAME_CONFIG.CANVAS_WIDTH / 2,
  START_Y: 110,
};

export const FISH_CONFIG = {
  // How many fish can be on screen at once
  MAX_FISH: 10,
  // How often (in milliseconds) a new fish might be spawned
  SPAWN_INTERVAL: 1000,
};

export const TRASH_CONFIG = {
    MAX_TRASH: 3,
    SPAWN_INTERVAL: 5000,
}

export type FishType = {
  name: string;
  width: number;
  height: number;
  points: number;
  speed: number; // pixels per frame
  color: string;
};

export type TrashType = {
    name: string;
    width: number;
    height: number;
    points: number; // Negative points
    speed: number;
    color: string;
}

// Add or remove fish types here
export const FISH_TYPES: FishType[] = [
  { name: 'Minnow', width: 30, height: 20, points: 10, speed: 1.5, color: '#c0c0c0' },
  { name: 'Trout', width: 50, height: 25, points: 50, speed: 2, color: '#8A9A5B' },
  { name: 'Salmon', width: 60, height: 30, points: 100, speed: 2.5, color: '#FA8072' },
  { name: 'Golden Fish', width: 40, height: 40, points: 500, speed: 3, color: '#FFD700' },
];

// Add or remove trash types here
export const TRASH_TYPES: TrashType[] = [
    { name: 'Old Boot', width: 30, height: 30, points: -25, speed: 0.5, color: '#5C4033' },
    { name: 'Tin Can', width: 25, height: 25, points: -15, speed: 0.7, color: '#A9A9A9' },
]