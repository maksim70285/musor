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
