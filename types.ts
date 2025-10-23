
export type StoryPage = {
  page: number;
  text: string;
  imagePrompt: string;
};

export type ChatMessage = {
  role: 'user' | 'model';
  content: string;
};

export type Tab = 'story' | 'chat';

export type VoiceOption = 'Kore' | 'Puck' | 'Zephyr' | 'Fenrir' | 'Charon';
