import React from 'react';
import { cn } from '../lib/utils';
import { UserName } from '../types';

interface UserAvatarProps {
  user: string;
  avatarUrl?: string;
  className?: string;
  onClick?: () => void;
}

export const UserAvatar = React.memo(function UserAvatar({ user, avatarUrl, className, onClick }: UserAvatarProps) {
  const isArtem = user === 'Артём';
  
  if (avatarUrl) {
    return (
      <div 
        onClick={onClick}
        className={cn(
          "rounded-full overflow-hidden flex items-center justify-center shrink-0 bg-black/5",
          onClick && "cursor-pointer hover:opacity-80 transition-opacity",
          className
        )}
      >
        <img loading="lazy" 
          src={avatarUrl} 
          alt={user} 
          className="w-full h-full object-cover" 
        />
      </div>
    );
  }

  return (
    <div 
      onClick={onClick}
      className={cn(
        "rounded-full flex items-center justify-center font-medium shrink-0",
        isArtem 
          ? "bg-[var(--color-artem-container)] text-[var(--color-artem-accent)]" 
          : "bg-[var(--color-maxim-container)] text-[var(--color-maxim-accent)]",
        onClick && "cursor-pointer hover:opacity-80 transition-opacity",
        className
      )}
    >
      {user.charAt(0).toUpperCase()}
    </div>
  );
}

);