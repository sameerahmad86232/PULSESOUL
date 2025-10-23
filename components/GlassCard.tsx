
import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`bg-black/20 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden transform transition-transform duration-700 ease-out hover:rotate-x-0 hover:rotate-y-0 rotate-x-2 -rotate-y-3 ${className}`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}
    </div>
  );
};

export default GlassCard;
