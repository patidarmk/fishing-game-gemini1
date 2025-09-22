import { useState, useEffect, useRef, useCallback } from 'react';
import { GAME_CONFIG, HOOK_CONFIG, FISH_CONFIG, TRASH_CONFIG, FISH_TYPES, TRASH_TYPES, FishType, TrashType } from '@/data/gameConfig';

// Define types for our game objects
export interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  direction: 'left' | 'right';
}

export interface Fish extends GameObject {
  type: FishType;
}

export interface Trash extends GameObject {
    type: TrashType;
}

export interface Hook {
  x: number;
  y: number;
  width: number;
  height: number;
  status: 'idle' | 'dropping' | 'reeling';
  caughtObject: Fish | Trash | null;
}

export type GameStatus = 'ready' | 'playing' | 'gameOver';

const HIGH_SCORE_KEY = 'fishingGameHighScore';

export const useGameEngine = () => {
  const [gameState, setGameState] = useState<{
    status: GameStatus;
    score: number;
    highScore: number;
    timer: number;
    hook: Hook;
    fishes: Fish[];
    trash: Trash[];
    popups: { x: number; y: number; text: string; id: number }[];
  }>({
    status: 'ready',
    score: 0,
    highScore: Number(localStorage.getItem(HIGH_SCORE_KEY)) || 0,
    timer: GAME_CONFIG.GAME_DURATION_S,
    hook: {
      x: HOOK_CONFIG.START_X,
      y: HOOK_CONFIG.START_Y,
      width: HOOK_CONFIG.WIDTH,
      height: HOOK_CONFIG.HEIGHT,
      status: 'idle',
      caughtObject: null,
    },
    fishes: [],
    trash: [],
    popups: [],
  });

  const gameLoopRef = useRef<number>();
  const lastFishSpawn = useRef(0);
  const lastTrashSpawn = useRef(0);

  const setStatus = (status: GameStatus) => {
    setGameState(prev => ({ ...prev, status }));
  };

  const updateScore = (points: number, x: number, y: number) => {
    setGameState(prev => {
      const newScore = prev.score + points;
      const newHighScore = Math.max(newScore, prev.highScore);
      if (newHighScore > prev.highScore) {
        localStorage.setItem(HIGH_SCORE_KEY, String(newHighScore));
      }
      return {
        ...prev,
        score: newScore,
        highScore: newHighScore,
        popups: [...prev.popups, { x, y, text: `${points > 0 ? '+' : ''}${points}`, id: Date.now() }],
      };
    });
  };

  const castLine = useCallback(() => {
    if (gameState.status === 'playing' && gameState.hook.status === 'idle') {
      setGameState(prev => ({ ...prev, hook: { ...prev.hook, status: 'dropping' } }));
    }
  }, [gameState.status, gameState.hook.status]);

  const startGame = () => {
    setGameState(prev => ({
      ...prev,
      status: 'playing',
      score: 0,
      timer: GAME_CONFIG.GAME_DURATION_S,
      hook: { ...prev.hook, x: HOOK_CONFIG.START_X, y: HOOK_CONFIG.START_Y, status: 'idle', caughtObject: null },
      fishes: [],
      trash: [],
      popups: [],
    }));
  };

  const gameLoop = useCallback(() => {
    if (gameState.status !== 'playing') return;

    const now = Date.now();

    setGameState(prev => {
      const newState = { ...prev };

      // Update hook
      if (newState.hook.status === 'dropping') {
        newState.hook.y += HOOK_CONFIG.DROP_SPEED;
      } else if (newState.hook.status === 'reeling') {
        newState.hook.y -= HOOK_CONFIG.REEL_SPEED;
        if (newState.hook.caughtObject) {
          newState.hook.caughtObject.y = newState.hook.y;
        }
      }

      // Check for collisions
      if (newState.hook.status === 'dropping') {
        const allObjects = [...newState.fishes, ...newState.trash];
        for (const obj of allObjects) {
          if (
            newState.hook.x < obj.x + obj.width &&
            newState.hook.x + newState.hook.width > obj.x &&
            newState.hook.y < obj.y + obj.height &&
            newState.hook.y + newState.hook.height > obj.y
          ) {
            newState.hook.status = 'reeling';
            newState.hook.caughtObject = obj;
            // Remove caught object from its array
            if ('type' in obj && 'points' in obj.type) {
                if (obj.type.points > 0) {
                    newState.fishes = newState.fishes.filter(f => f !== obj);
                } else {
                    newState.trash = newState.trash.filter(t => t !== obj);
                }
            }
            break;
          }
        }
      }

      // Reset hook if it goes off-screen or reaches the top
      if (newState.hook.y > GAME_CONFIG.CANVAS_HEIGHT || (newState.hook.status === 'reeling' && newState.hook.y <= HOOK_CONFIG.START_Y)) {
        if (newState.hook.caughtObject) {
          updateScore(newState.hook.caughtObject.type.points, newState.hook.x, HOOK_CONFIG.START_Y);
        }
        newState.hook = { ...newState.hook, y: HOOK_CONFIG.START_Y, status: 'idle', caughtObject: null };
      }

      // Update fish positions
      newState.fishes = newState.fishes.map(fish => {
        const newX = fish.direction === 'right' ? fish.x + fish.speed : fish.x - fish.speed;
        if (newX > GAME_CONFIG.CANVAS_WIDTH || newX < -fish.width) {
          // Fish is off-screen, remove it
          return null;
        }
        return { ...fish, x: newX };
      }).filter((f): f is Fish => f !== null);

      // Update trash positions
      newState.trash = newState.trash.map(t => {
        const newX = t.direction === 'right' ? t.x + t.speed : t.x - t.speed;
        if (newX > GAME_CONFIG.CANVAS_WIDTH || newX < -t.width) {
            return null;
        }
        return { ...t, x: newX };
      }).filter((t): t is Trash => t !== null);

      // Spawn new fish
      if (now - lastFishSpawn.current > FISH_CONFIG.SPAWN_INTERVAL && newState.fishes.length < FISH_CONFIG.MAX_FISH) {
        lastFishSpawn.current = now;
        const type = FISH_TYPES[Math.floor(Math.random() * FISH_TYPES.length)];
        const direction = Math.random() > 0.5 ? 'right' : 'left';
        newState.fishes.push({
          type,
          width: type.width,
          height: type.height,
          speed: type.speed,
          direction,
          x: direction === 'right' ? -type.width : GAME_CONFIG.CANVAS_WIDTH,
          y: Math.random() * (GAME_CONFIG.CANVAS_HEIGHT - 200) + 150,
        });
      }

      // Spawn new trash
      if (now - lastTrashSpawn.current > TRASH_CONFIG.SPAWN_INTERVAL && newState.trash.length < TRASH_CONFIG.MAX_TRASH) {
        lastTrashSpawn.current = now;
        const type = TRASH_TYPES[Math.floor(Math.random() * TRASH_TYPES.length)];
        const direction = Math.random() > 0.5 ? 'right' : 'left';
        newState.trash.push({
            type,
            width: type.width,
            height: type.height,
            speed: type.speed,
            direction,
            x: direction === 'right' ? -type.width : GAME_CONFIG.CANVAS_WIDTH,
            y: Math.random() * (GAME_CONFIG.CANVAS_HEIGHT - 200) + 150,
        });
      }

      // Remove old popups
      newState.popups = newState.popups.filter(p => Date.now() - p.id < 1000);

      return newState;
    });

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameState.status]);

  // Timer effect
  useEffect(() => {
    if (gameState.status === 'playing') {
      const interval = setInterval(() => {
        setGameState(prev => {
          if (prev.timer > 1) {
            return { ...prev, timer: prev.timer - 1 };
          }
          setStatus('gameOver');
          return { ...prev, timer: 0 };
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameState.status]);

  // Game loop effect
  useEffect(() => {
    if (gameState.status === 'playing') {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.status, gameLoop]);

  return { gameState, castLine, startGame, setStatus };
};