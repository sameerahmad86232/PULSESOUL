import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";

import type { StoryPage, ChatMessage, Tab } from './types';
import { generateStory, generateImage, generateSpeech, continueChat } from './services/geminiService';
import Header from './components/Header';
import StoryViewer from './components/StoryViewer';
import ChatBot from './components/ChatBot';
import { playAudio, stopCurrentAudio, togglePauseResumeAudio } from './utils/audio';
import { BACKGROUND_MUSIC_DATA_URL } from './utils/audio';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('story');
  
  // Story state
  const [storyPages, setStoryPages] = useState<StoryPage[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [images, setImages] = useState<Record<number, string>>({});
  const [isLoadingStory, setIsLoadingStory] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSavedStory, setHasSavedStory] = useState(false);
  
  // Audio state
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isAudioPaused, setIsAudioPaused] = useState(false);
  
  // UX state
  const [isMusicOn, setIsMusicOn] = useState(true);
  const [isAutoPlayOn, setIsAutoPlayOn] = useState(true);
  const [musicAudio, setMusicAudio] = useState<HTMLAudioElement | null>(null);

  // Chat state
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isBotTyping, setIsBotTyping] = useState(false);

  useEffect(() => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const newChatSession = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: 'You are a friendly, patient, and cheerful companion for a 5-year-old child. Answer their questions in a simple, fun, and encouraging way. Keep your answers short and easy to understand.'
        }
      });
      setChatSession(newChatSession);
      setChatHistory([
        { role: 'model', content: 'Hi there! I\'m your friendly robot friend. Ask me anything!' }
      ]);
    } catch(e) {
      console.error(e);
      setError('Could not initialize the chat bot. Please check your API key.');
    }

    if (localStorage.getItem('savedStorySparkStory')) {
      setHasSavedStory(true);
    }
    
    // Setup background music
    const audio = new Audio(BACKGROUND_MUSIC_DATA_URL);
    audio.loop = true;
    audio.volume = 0.1;
    setMusicAudio(audio);

    return () => {
      audio.pause();
      stopCurrentAudio();
    }
  }, []);
  
  // Effect for controlling background music
  useEffect(() => {
    if (!musicAudio) return;
    const shouldPlay = isMusicOn && storyPages.length > 0;
    if (shouldPlay) {
      musicAudio.play().catch(e => console.error("BG Music autoplay failed:", e));
    } else {
      musicAudio.pause();
    }
  }, [isMusicOn, storyPages.length, musicAudio]);

  const handleGenerateStory = async () => {
    setIsLoadingStory(true);
    setStoryPages([]);
    setImages({});
    setCurrentPageIndex(0);
    setError(null);
    try {
      const pages = await generateStory('A short, happy story about a friendly dragon named Sparky who learns to fly.');
      setStoryPages(pages);
    } catch (e) {
      console.error(e);
      setError('Oops! I couldn\'t dream up a story right now. Please try again.');
    } finally {
      setIsLoadingStory(false);
    }
  };
  
  const handleSaveStory = () => {
    try {
      const storyData = { storyPages, images };
      localStorage.setItem('savedStorySparkStory', JSON.stringify(storyData));
      setHasSavedStory(true);
    } catch (e) {
      console.error("Failed to save story:", e);
      setError("I couldn't save the story. Your browser's storage might be full!");
    }
  };

  const handleLoadStory = () => {
    try {
      const savedStoryJson = localStorage.getItem('savedStorySparkStory');
      if (savedStoryJson) {
        const savedStory = JSON.parse(savedStoryJson);
        if (savedStory.storyPages && savedStory.images) {
          setStoryPages(savedStory.storyPages);
          setImages(savedStory.images);
          setCurrentPageIndex(0);
          setError(null);
        } else {
           throw new Error("Saved story data is not in the correct format.");
        }
      }
    } catch (e) {
      console.error("Failed to load story:", e);
      setError("I couldn't load the saved story. It might be corrupted.");
      localStorage.removeItem('savedStorySparkStory');
      setHasSavedStory(false);
    }
  };

  const handleReadAloud = useCallback(async () => {
    if (storyPages.length === 0) return;
    setIsLoadingAudio(true);
    setError(null);
    try {
      const textToRead = storyPages[currentPageIndex].text;
      const audioData = await generateSpeech(textToRead);
      await playAudio(audioData, () => {
        setIsAudioPlaying(false);
        setIsAudioPaused(false);
      });
      setIsAudioPlaying(true);
      setIsAudioPaused(false);
    } catch (e) {
      console.error(e);
      setError('My voice seems to be sleeping! Could you try again?');
      setIsAudioPlaying(false);
      setIsAudioPaused(false);
    } finally {
      setIsLoadingAudio(false);
    }
  }, [currentPageIndex, storyPages]);
  
  const handleToggleAudioPause = () => {
    const isNowPaused = togglePauseResumeAudio();
    setIsAudioPaused(isNowPaused);
  };
  
  // Effect for auto-playing story audio
  useEffect(() => {
    if (isAutoPlayOn && storyPages.length > 0) {
      handleReadAloud();
    } else {
      stopCurrentAudio();
      setIsAudioPlaying(false);
      setIsAudioPaused(false);
    }
  }, [currentPageIndex, storyPages, isAutoPlayOn, handleReadAloud]);
  
  const handleSendMessage = async (message: string) => {
      if (!chatSession) return;
      
      const userMessage: ChatMessage = { role: 'user', content: message };
      setChatHistory(prev => [...prev, userMessage]);
      setIsBotTyping(true);

      try {
          const responseText = await continueChat(chatSession, message);
          const botMessage: ChatMessage = { role: 'model', content: responseText };
          setChatHistory(prev => [...prev, botMessage]);
      } catch (e) {
          console.error(e);
          const errorMessage: ChatMessage = { role: 'model', content: "Uh oh! My circuits are a bit fuzzy. Can you ask me that again?" };
          setChatHistory(prev => [...prev, errorMessage]);
      } finally {
          setIsBotTyping(false);
      }
  };

  useEffect(() => {
    const fetchImageForCurrentPage = async () => {
      if (storyPages.length > 0 && !images[currentPageIndex]) {
        setIsLoadingImage(true);
        setError(null);
        try {
          const prompt = storyPages[currentPageIndex].imagePrompt;
          const imageUrl = await generateImage(prompt);
          setImages(prev => ({ ...prev, [currentPageIndex]: imageUrl }));
        } catch (e) {
          console.error(e);
          setError('The magic paintbrushes are busy! Failed to create an illustration.');
        } finally {
          setIsLoadingImage(false);
        }
      }
    };
    fetchImageForCurrentPage();
  }, [currentPageIndex, storyPages, images]);

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-600 p-4 sm:p-6 lg:p-8 flex flex-col items-center"
      style={{ perspective: '1500px' }}
    >
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="w-full max-w-4xl flex-grow">
        {activeTab === 'story' ? (
          <StoryViewer
            storyPages={storyPages}
            currentPageIndex={currentPageIndex}
            setCurrentPageIndex={setCurrentPageIndex}
            images={images}
            onGenerateStory={handleGenerateStory}
            isLoadingStory={isLoadingStory}
            isLoadingImage={isLoadingImage}
            error={error}
            onSaveStory={handleSaveStory}
            onLoadStory={handleLoadStory}
            hasSavedStory={hasSavedStory}
            isMusicOn={isMusicOn}
            onToggleMusic={() => setIsMusicOn(prev => !prev)}
            isAutoPlayOn={isAutoPlayOn}
            onToggleAutoPlay={() => setIsAutoPlayOn(prev => !prev)}
            isLoadingAudio={isLoadingAudio}
            isAudioPlaying={isAudioPlaying}
            isAudioPaused={isAudioPaused}
            onReadAloud={handleReadAloud}
            onToggleAudioPause={handleToggleAudioPause}
          />
        ) : (
          <ChatBot
            history={chatHistory}
            onSendMessage={handleSendMessage}
            isTyping={isBotTyping}
            error={error}
          />
        )}
      </main>
    </div>
  );
};

export default App;