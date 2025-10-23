
import React, { useState, useEffect } from 'react';
import type { StoryPage } from '../types';
import GlassCard from './GlassCard';
import { SparklesIcon, SpeakerIcon, NextIcon, PrevIcon, LoadingSpinner, SaveIcon, LoadIcon, MusicOnIcon, MusicOffIcon, AutoPlayOnIcon, AutoPlayOffIcon, PlayIcon, PauseIcon } from './icons';

interface StoryViewerProps {
  storyPages: StoryPage[];
  currentPageIndex: number;
  setCurrentPageIndex: (index: number) => void;
  images: Record<number, string>;
  onGenerateStory: () => void;
  isLoadingStory: boolean;
  isLoadingImage: boolean;
  error: string | null;
  onSaveStory: () => void;
  onLoadStory: () => void;
  hasSavedStory: boolean;
  isMusicOn: boolean;
  onToggleMusic: () => void;
  isAutoPlayOn: boolean;
  onToggleAutoPlay: () => void;
  isLoadingAudio: boolean;
  isAudioPlaying: boolean;
  isAudioPaused: boolean;
  onReadAloud: () => void;
  onToggleAudioPause: () => void;
}

const StoryViewer: React.FC<StoryViewerProps> = ({
  storyPages,
  currentPageIndex,
  setCurrentPageIndex,
  images,
  onGenerateStory,
  isLoadingStory,
  isLoadingImage,
  error,
  onSaveStory,
  onLoadStory,
  hasSavedStory,
  isMusicOn,
  onToggleMusic,
  isAutoPlayOn,
  onToggleAutoPlay,
  isLoadingAudio,
  isAudioPlaying,
  isAudioPaused,
  onReadAloud,
  onToggleAudioPause,
}) => {
  const hasStory = storyPages.length > 0;
  const [saveButtonText, setSaveButtonText] = useState('Save');

  useEffect(() => {
    setSaveButtonText('Save');
  }, [storyPages, currentPageIndex]);
  
  const handleSaveClick = () => {
    onSaveStory();
    setSaveButtonText('Saved!');
    setTimeout(() => {
      setSaveButtonText('Save');
    }, 2000);
  };

  const renderReadAloudButton = () => {
    const baseClasses = "flex items-center gap-1 text-white font-bold py-2 px-3 rounded-full shadow-md transform hover:-translate-y-px active:translate-y-0 disabled:opacity-70 disabled:bg-gray-400 transition-all";
    
    if (isLoadingAudio) {
      return (
        <button disabled className={`${baseClasses} bg-gray-500`}>
          <LoadingSpinner className="w-5 h-5"/>
          <span className="hidden sm:inline">...</span>
        </button>
      );
    }
    
    if (isAudioPlaying) {
      return (
        <button onClick={onToggleAudioPause} className={`${baseClasses} bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-500/30`}>
          {isAudioPaused ? <PlayIcon /> : <PauseIcon />}
          <span className="hidden sm:inline">{isAudioPaused ? 'Resume' : 'Pause'}</span>
        </button>
      );
    }

    return (
      <button onClick={onReadAloud} className={`${baseClasses} bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-500/30`}>
        <SpeakerIcon />
        <span className="hidden sm:inline">Read</span>
      </button>
    );
  };

  return (
    <GlassCard>
      {isLoadingStory ? (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
          <LoadingSpinner className="w-16 h-16 text-white" />
          <p className="mt-4 text-white text-xl">Dreaming up a new story...</p>
        </div>
      ) : !hasStory ? (
        <div className="text-center p-8 flex flex-col items-center justify-center h-full min-h-[400px]">
          <h2 className="text-3xl font-bold text-white mb-4">Ready for an Adventure?</h2>
          <p className="text-white/80 mb-8 text-lg">Create a brand new story, or load your last one!</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onGenerateStory}
              className="flex items-center gap-2 bg-gradient-to-br from-pink-500 to-rose-600 text-white font-bold py-3 px-6 rounded-full text-xl shadow-lg shadow-pink-500/30 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 active:scale-100 active:translate-y-0"
            >
              <SparklesIcon />
              Create New Story
            </button>
            {hasSavedStory && (
               <button
                onClick={onLoadStory}
                className="flex items-center gap-2 bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-bold py-3 px-6 rounded-full text-xl shadow-lg shadow-purple-500/30 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 active:scale-100 active:translate-y-0"
              >
                <LoadIcon />
                Load Story
              </button>
            )}
          </div>
          {error && <p className="mt-4 text-yellow-300 bg-red-800/50 p-2 rounded">{error}</p>}
        </div>
      ) : (
        <>
        <div className="flex flex-col md:flex-row gap-6 p-6">
          <div className="md:w-1/2 h-80 md:h-auto bg-black/20 rounded-xl flex items-center justify-center overflow-hidden transform transition-transform duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-black/50">
            {isLoadingImage ? (
              <div className="flex flex-col items-center">
                <LoadingSpinner className="w-12 h-12 text-white" />
                <p className="text-white mt-2">Painting a picture...</p>
              </div>
            ) : (
              images[currentPageIndex] && <img src={images[currentPageIndex]} alt={`Illustration for page ${currentPageIndex + 1}`} className="w-full h-full object-cover" />
            )}
          </div>
          <div className="md:w-1/2 flex flex-col">
            <p className="text-white/90 text-lg leading-relaxed flex-grow">{storyPages[currentPageIndex].text}</p>
            {error && <p className="my-2 text-yellow-300 bg-red-800/50 p-2 rounded">{error}</p>}
            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={() => setCurrentPageIndex(currentPageIndex - 1)}
                disabled={currentPageIndex === 0}
                className="p-3 rounded-full bg-gradient-to-br from-white/20 to-white/10 hover:from-white/30 hover:to-white/20 border border-white/30 shadow-lg transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all duration-300"
                aria-label="Previous Page"
              >
                <PrevIcon />
              </button>
              <div className="flex items-center gap-2 flex-wrap justify-center">
                 <button onClick={onToggleMusic} className="p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 shadow-md transform hover:-translate-y-px active:translate-y-0 text-white transition-all" aria-label="Toggle Music">
                    {isMusicOn ? <MusicOnIcon /> : <MusicOffIcon />}
                  </button>
                  <button onClick={onToggleAutoPlay} className="p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 shadow-md transform hover:-translate-y-px active:translate-y-0 text-white transition-all" aria-label="Toggle Auto-Play">
                    {isAutoPlayOn ? <AutoPlayOnIcon /> : <AutoPlayOffIcon />}
                  </button>
                 <button
                    onClick={handleSaveClick}
                    disabled={saveButtonText === 'Saved!'}
                    className="flex items-center gap-1 bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-bold py-2 px-3 rounded-full shadow-md shadow-purple-500/30 transform hover:-translate-y-px active:translate-y-0 disabled:opacity-70 transition-all"
                  >
                    <SaveIcon />
                    <span className="hidden sm:inline">{saveButtonText}</span>
                  </button>
                  {renderReadAloudButton()}
                  <span className="text-white font-bold text-lg px-2">{currentPageIndex + 1} / {storyPages.length}</span>
              </div>
              <button
                onClick={() => setCurrentPageIndex(currentPageIndex + 1)}
                disabled={currentPageIndex === storyPages.length - 1}
                className="p-3 rounded-full bg-gradient-to-br from-white/20 to-white/10 hover:from-white/30 hover:to-white/20 border border-white/30 shadow-lg transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all duration-300"
                aria-label="Next Page"
              >
                <NextIcon />
              </button>
            </div>
          </div>
        </div>
        <div className="p-6 pt-0 text-center">
            <button
              onClick={onGenerateStory}
              className="flex items-center gap-2 mx-auto bg-gradient-to-br from-pink-500 to-rose-600 text-white font-bold py-3 px-6 rounded-full text-lg shadow-lg shadow-pink-500/30 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 active:scale-100 active:translate-y-0"
            >
              <SparklesIcon />
              Create Another Story
            </button>
        </div>
        </>
      )}
    </GlassCard>
  );
};

export default StoryViewer;
