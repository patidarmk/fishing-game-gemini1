import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Timer, Star } from 'lucide-react';

interface HudProps {
  score: number;
  highScore: number;
  timer: number;
  popups: { x: number; y: number; text: string; id: number }[];
}

const Hud: React.FC<HudProps> = ({ score, highScore, timer, popups }) => {
  return (
    <div className="absolute top-0 left-0 right-0 p-4 text-white font-bold text-2xl z-10">
      <div className="container mx-auto flex justify-between items-center bg-black/30 backdrop-blur-sm p-4 rounded-xl shadow-lg">
        <div className="flex items-center space-x-2">
          <Star className="text-yellow-400" />
          <span>Score: {score}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Trophy className="text-yellow-400" />
          <span>High Score: {highScore}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Timer className="text-blue-400" />
          <span>Time: {timer}</span>
        </div>
      </div>
      <AnimatePresence>
        {popups.map(popup => (
          <motion.div
            key={popup.id}
            initial={{ opacity: 1, y: 0, scale: 0.5 }}
            animate={{ opacity: 0, y: -50, scale: 1.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute text-4xl font-black"
            style={{
              left: popup.x,
              top: popup.y,
              color: popup.text.startsWith('-') ? '#ff4d4d' : '#4dff4d',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            }}
          >
            {popup.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Hud;