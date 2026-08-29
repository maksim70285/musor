export type UserName = 'Артём' | 'Максим';
export type TaskType = 'trash' | 'dishwasher';

export type TimeType = 'exact' | 'approximate' | 'custom';
export type ApproximateTime = 'утром' | 'днём' | 'вечером' | 'ночью';

export interface Entry {
  id: string;
  taskType: TaskType;
  date: string;
  user: UserName;
  timeType: TimeType;
  timeValue: string;
  isOutOfOrder?: boolean;
  outOfOrderReason?: string;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  user: UserName;
  text?: string;
  fileUrl?: string;
  fileType?: 'image' | 'video';
  createdAt: number;
}

export interface Roulette {
  id: string;
  name: string;
  options: string[];
}
