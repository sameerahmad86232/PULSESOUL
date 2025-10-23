
import React from 'react';
import type { Tab } from '../types';
import { BookIcon, MessageIcon } from './icons';

interface HeaderProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const getTabClass = (tabName: Tab) => {
    return `flex items-center gap-2 px-4 py-2 rounded-lg text-lg font-bold transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 ${
      activeTab === tabName
        ? 'bg-white/30 text-white shadow-md'
        : 'text-white/70 hover:bg-white/20'
    }`;
  };

  return (
    <header className="w-full max-w-4xl mb-6">
      <h1 className="text-5xl sm:text-6xl font-black text-white text-center mb-4" style={{ textShadow: '0 4px 25px rgba(255, 255, 255, 0.5)'}}>
        StorySpark AI
      </h1>
      <nav className="flex justify-center items-center gap-4 p-2 rounded-xl bg-black/20">
        <button onClick={() => setActiveTab('story')} className={getTabClass('story')}>
          <BookIcon />
          Story Time
        </button>
        <button onClick={() => setActiveTab('chat')} className={getTabClass('chat')}>
          <MessageIcon />
          Chat
        </button>
      </nav>
    </header>
  );
};

export default Header;
