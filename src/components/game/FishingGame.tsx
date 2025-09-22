import React, { useEffect } from 'react';
import { useGameEngine } from '@/hooks/useGameEngine';
import GameCanvas from './GameCanvas.tsx';
import Hud from './Hud.tsx';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { MadeWithApplaa } from '../made-with-applaa';

const FishingGame: React.FC = () => {
  const { gameState, castLine, startGame } = useGameEngine();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (gameState.status !== 'playing') {
            startGame();
        } else {
            castLine();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [castLine, startGame, gameState.status]);

  const handleGameClick = () => {
    if (gameState.status === 'playing') {
      castLine();
    }
  };

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <h1 className="text-5xl font-bold text-white mb-4 text-center" style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.4)' }}>
        Applaa Fishing Adventure
      </h1>
      <div
        className="relative bg-white/20 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden cursor-pointer"
        style={{ width: 800, height: 600 }}
        onClick={handleGameClick}
      >
        <Hud score={gameState.score} highScore={gameState.highScore} timer={gameState.timer} popups={gameState.popups} />
        <GameCanvas hook={gameState.hook} fishes={gameState.fishes} trash={gameState.trash} />
        <AnimatePresence>
          {gameState.status !== 'playing' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-20 cursor-default"
            >
              {gameState.status === 'ready' && (
                <>
                  <h2 className="text-6xl font-extrabold text-white mb-4">Ready to Fish?</h2>
                  <p className="text-xl text-white mb-8">Click the button or Press Space to Cast!</p>
                  <Button size="lg" onClick={(e) => { e.stopPropagation(); startGame(); }} className="text-2xl px-8 py-6">
                    Start Game
                  </Button>
                </>
              )}
              {gameState.status === 'gameOver' && (
                <>
                  <h2 className="text-6xl font-extrabold text-white mb-4">Game Over!</h2>
                  <p className="text-3xl text-white mb-2">Final Score: {gameState.score}</p>
                  {gameState.score >= gameState.highScore && gameState.score > 0 && <p className="text-2xl text-yellow-400 mb-8">New High Score!</p>}
                  <Button size="lg" onClick={(e) => { e.stopPropagation(); startGame(); }} className="text-2xl px-8 py-6">
                    Play Again
                  </Button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="absolute bottom-0 w-full">
        <MadeWithApplaa />
      </div>
    </div>
  );
};

export default FishingGame;