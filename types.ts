export interface User {
  name: string;
  email: string;
  avatar: string;
}

export interface Workout {
  id: string;
  name: string;
  reps: number;
  weight: number;
  date: string;
}

export interface Food {
  id: string;
  name: string;
  calories: number;
  protein: number;
  date: string;
}

export interface Goal {
  id: string;
  name: string;
  target: number;
  current: number;
  unit: string;
}

export interface AppState {
  user: User | null;
  workouts: Workout[];
  foods: Food[];
  goals: Goal[];
  streak: number;
  isDarkMode: boolean;
}

export type PageType = 'dashboard' | 'workout' | 'nutrition' | 'goals' | 'settings' | 'ai-coach' | 'motivation';