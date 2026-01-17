export interface WorkoutStep {
  title: string;
  duration: number; // in seconds
  description: string;
  videoUrl?: string; // Optional: URL to a local video or animation file
}

export interface Course {
  id: string;
  title: string;
  duration: string;
  image: string;
  description: string;
  steps: WorkoutStep[];
  category: 'zone' | 'problem' | 'scenario';
}

export interface SelfieLog {
  id: string;
  date: string; // ISO string
  imageData?: string; // Base64 (Legacy support)
  images?: {
    front: string;
    side?: string;
  };
  courseId: string;
}

export interface CommunityPost {
  id: string;
  username: string;
  avatar: string;
  image: string;
  message: string;
  likes: number;
  timeAgo: string;
}

export enum ViewState {
  HOME = 'HOME',
  WORKOUT = 'WORKOUT',
  CAMERA = 'CAMERA',
  GALLERY = 'GALLERY',
  COMMUNITY = 'COMMUNITY'
}

export interface UserProgress {
  streak: number;
  totalWorkouts: number;
}