import React, { useRef, useEffect } from 'react';
import { GAME_CONFIG } from '@/data/gameConfig';
import type { Hook, Fish, Trash } from '@/hooks/useGameEngine';

interface GameCanvasProps {
  hook: Hook;
  fishes: Fish[];
  trash: Trash[];
}

const GameCanvas: React.FC<GameCanvasProps> = ({ hook, fishes, trash }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw water
    const waterGradient = ctx.createLinearGradient(0, 120, 0, canvas.height);
    waterGradient.addColorStop(0, '#1E90FF');
    waterGradient.addColorStop(1, '#00008B');
    ctx.fillStyle = waterGradient;
    ctx.fillRect(0, 120, canvas.width, canvas.height - 120);

    // Draw boat
    ctx.fillStyle = '#8B4513'; // Brown color for the boat
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 60, 120);
    ctx.lineTo(canvas.width / 2 + 60, 120);
    ctx.lineTo(canvas.width / 2 + 40, 140);
    ctx.lineTo(canvas.width / 2 - 40, 140);
    ctx.closePath();
    ctx.fill();

    // Draw fisherman
    ctx.fillStyle = '#000';
    ctx.fillRect(canvas.width / 2 - 5, 90, 10, 30); // Body
    ctx.beginPath();
    ctx.arc(canvas.width / 2, 85, 8, 0, Math.PI * 2); // Head
    ctx.fill();

    // Draw fishing line
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 110);
    ctx.lineTo(hook.x, hook.y);
    ctx.stroke();

    // Draw hook
    ctx.fillStyle = '#c0c0c0';
    ctx.fillRect(hook.x - hook.width / 2, hook.y, hook.width, hook.height);

    // Draw fishes
    fishes.forEach(fish => {
      ctx.fillStyle = fish.type.color;
      ctx.fillRect(fish.x, fish.y, fish.width, fish.height);
    });

    // Draw trash
    trash.forEach(t => {
        ctx.fillStyle = t.type.color;
        ctx.fillRect(t.x, t.y, t.width, t.height);
    });

    // Draw caught object
    if (hook.caughtObject) {
        ctx.fillStyle = hook.caughtObject.type.color;
        ctx.fillRect(hook.caughtObject.x, hook.caughtObject.y, hook.caughtObject.width, hook.caughtObject.height);
    }
  }, [hook, fishes, trash]);

  return <canvas ref={canvasRef} width={GAME_CONFIG.CANVAS_WIDTH} height={GAME_CONFIG.CANVAS_HEIGHT} className="rounded-lg shadow-lg" />;
};

export default GameCanvas;