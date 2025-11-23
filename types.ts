
export enum AppState {
  IDLE = 'IDLE',
  CONFIGURING = 'CONFIGURING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export enum View {
  LANDING = 'LANDING',
  AUTH = 'AUTH',
  APP = 'APP',
  MOTION = 'MOTION',
  PRICING = 'PRICING',
  GALLERY = 'GALLERY'
}

export type EmojiStyle = '3D' | 'CLAY' | 'PIXEL' | 'ANIME';
export type EmojiMood = 'HAPPY' | 'COOL' | 'SURPRISED' | 'LOVE' | 'ANGRY';
export type MotionType = 'WINK' | 'WAVE' | 'LAUGH' | 'DANCE' | 'NOD';

export interface EmojiConfig {
  style: EmojiStyle;
  mood: EmojiMood;
}

export interface EmojiGenerationResult {
  imageUrl: string;
}

export interface GalleryItem {
  id: string;
  generatedImage: string; // Used for image URL or Video Thumbnail (if we had one, currently using placeholder for video)
  videoUrl?: string; // Optional, only for videos
  originalImage: string;
  style: EmojiStyle | 'VIDEO';
  mood: EmojiMood | string;
  mediaType: 'IMAGE' | 'VIDEO';
  createdAt: number;
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  credits_added: number;
  plan_name: string;
  provider: string;
  status: string;
  created_at: string;
}
