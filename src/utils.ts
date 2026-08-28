import { Entry, UserName } from './types';

export const getSortedEntries = (entries: Entry[]) => {
  return [...entries].sort((a, b) => {
    if (a.date !== b.date) {
      return b.date.localeCompare(a.date);
    }
    return b.createdAt - a.createdAt;
  });
};

export const getLastNormalEntry = (entries: Entry[]) => {
  const sorted = getSortedEntries(entries);
  return sorted.find(e => !e.isOutOfOrder);
};

export const getLastEntry = (entries: Entry[]) => {
  return getSortedEntries(entries)[0];
};

export const getNextUser = (entries: Entry[]): UserName => {
  const lastNormal = getLastNormalEntry(entries);
  // Default fallback according to initial data (Artem was last, so Maksim is next)
  if (!lastNormal) return 'Максим'; 
  return lastNormal.user === 'Артём' ? 'Максим' : 'Артём';
};

export const getOppositeUser = (user: UserName): UserName => {
  return user === 'Артём' ? 'Максим' : 'Артём';
};

export const formatRelativeDate = (dateStr: string) => {
  const today = getMoscowDateString();
  if (dateStr === today) return 'сегодня';
  const [year, month, day] = dateStr.split('-');
  return `${day}.${month}.${year.slice(2)}`;
};

export const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
};

export const formatShortDate = (dateStr: string) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}.${month}.${year.slice(2)}`;
};

// YYYY-MM-DD in Moscow time
export const getMoscowDateString = () => {
  const date = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Moscow',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const parts = formatter.formatToParts(date);
  const year = parts.find(p => p.type === 'year')?.value;
  const month = parts.find(p => p.type === 'month')?.value;
  const day = parts.find(p => p.type === 'day')?.value;
  return `${year}-${month}-${day}`;
};

export const getMoscowTimeString = () => {
  const date = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Moscow',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  });
  return formatter.format(date);
};
