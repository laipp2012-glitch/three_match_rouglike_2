import React from 'react';
import { FloatingText } from '../types';

interface Props {
  texts: FloatingText[];
  onComplete: (id: string) => void;
}

const FloatingCombatText: React.FC<Props> = ({ texts, onComplete }) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-[100] overflow-hidden">
      <style>{`
        @keyframes floatUpFade {
          0% {
            opacity: 1;
            transform: translate(-50%, 0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -100px) scale(1.5);
          }
        }
        .combat-text-anim {
          animation: floatUpFade 1.5s cubic-bezier(0.23, 1, 0.32, 1) forwards;
          will-change: transform, opacity;
        }
      `}</style>
      {texts.map(t => (
        <FloatingItem key={t.id} text={t} onComplete={onComplete} />
      ))}
    </div>
  );
};

const FloatingItem: React.FC<{ text: FloatingText; onComplete: (id: string) => void }> = ({ text, onComplete }) => {
  return (
    <div 
      className="combat-text-anim absolute font-black text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] whitespace-nowrap"
      style={{
        left: `${text.x}%`,
        top: `${text.y}%`,
        color: text.color,
      }}
      onAnimationEnd={() => onComplete(text.id)}
    >
      {text.text}
    </div>
  );
};

export default FloatingCombatText;