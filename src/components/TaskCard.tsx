import React, { useState, useRef } from 'react';
import { Entry, TaskType, UserName } from '../types';
import { api } from '../api';
import { getLastEntry, getNextUser, formatRelativeDate } from '../utils';
import { cn } from '../lib/utils';
import { Check, Camera, Video, X, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserAvatar } from './UserAvatar';

interface TaskCardProps {
  key?: React.Key;
  id: TaskType;
  title: string;
  icon: string;
  entries: Entry[];
  currentUser: UserName;
  onAdd: (taskId: TaskType, isOutOfOrder: boolean, reason?: string, fileUrl?: string, fileType?: 'image' | 'video') => Promise<void>;
  buttonText: string;
  avatars: Record<string, string>;
}

export const TaskCard = React.memo(function TaskCard({ id, title, icon, entries, currentUser, onAdd, buttonText, avatars }: TaskCardProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [showOutOfOrder, setShowOutOfOrder] = useState(false);
  const [customReason, setCustomReason] = useState('');
  
  const [showProofOptions, setShowProofOptions] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const taskEntries = entries.filter(e => e.taskType === id);
  const lastEntry = getLastEntry(taskEntries);
  const nextUser = getNextUser(taskEntries);
  const isMyTurn = nextUser === currentUser;

  const handleAdd = async () => {
    if (!isMyTurn) {
      setShowOutOfOrder(true);
      return;
    }
    setShowProofOptions(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const submitAdd = async (isOutOfOrder: boolean, reason?: string, fileUrl?: string, fileType?: 'image' | 'video') => {
    setShowOutOfOrder(false);
    setShowProofOptions(false);
    setIsUploading(true);
    await onAdd(id, isOutOfOrder, reason, fileUrl, fileType);
    setIsUploading(false);
    setFile(null);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
    }, 3000);
  };

  const handleUploadAndSubmit = async () => {
    if (!file) return;
    setIsUploading(true);
    const fileUrl = await api.uploadFile(file);
    const fileType = file.type.startsWith('video/') ? 'video' : 'image';
    await submitAdd(false, undefined, fileUrl || undefined, fileUrl ? fileType : undefined);
  };

  return (
    <div 
      className={cn(
        "p-6 sm:p-8 transition-all relative overflow-hidden bg-cover bg-center",
        isMyTurn 
          ? "bg-[var(--color-md-sys-color-secondary-container)] text-[var(--color-md-sys-color-on-secondary-container)] rounded-[24px] shadow-sm" 
          : "m3-card-outlined rounded-[24px]"
      )}
      style={{ backgroundImage: `url('https://i.ibb.co/ynsQCQ5j/IMG-5741.jpg')` }}
    >
      <div className="absolute inset-0 bg-black/60 pointer-events-none" />
      <div className="relative z-10 h-full">
        <div className="flex items-center gap-4 mb-6">
        <img loading="lazy" src={icon} alt={title} className="w-20 h-20 object-contain [image-rendering:pixelated] pointer-events-none select-none" />
        <h2 className="m3-headline-sm">{title}</h2>
      </div>
      
      <div className="mb-8 min-h-[5rem] flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-[var(--color-md-sys-color-primary)]"
            >
              <div className="m3-headline-sm flex items-center gap-3 mb-2">
                <Check size={32} strokeWidth={2} />
                Готово
              </div>
              <div className="m3-label-md mt-2 opacity-80 uppercase tracking-widest flex items-center gap-2">
                СЛЕДУЮЩИЙ: 
                <UserAvatar user={nextUser} avatarUrl={avatars[nextUser]} className="w-6 h-6 text-xs normal-case tracking-normal" />
                {nextUser}
              </div>
            </motion.div>
          ) : showProofOptions ? (
            <motion.div
              key="proof-options"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="m3-title-lg mb-2">Задача выполнена</div>
              {!file ? (
                <div className="flex flex-col gap-2">
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleFileChange} />
                  <button onClick={() => fileInputRef.current?.click()} className="m3-btn-tonal justify-start !px-5 w-full h-[48px] gap-2">
                    <Camera size={20} /> Добавить доказательство
                  </button>
                  <button onClick={() => submitAdd(false)} className="m3-btn-filled justify-start !px-5 w-full h-[48px]">
                    Просто выполнить
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-full h-32 bg-black rounded-lg overflow-hidden flex items-center justify-center">
                    {file.type.startsWith('video/') ? (
                      <Video size={32} className="text-white" />
                    ) : (
                      <img loading="lazy" src={URL.createObjectURL(file)} className="h-full object-contain" />
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setFile(null)} className="m3-btn-tonal flex-1 h-[48px]">
                      <X size={20} />
                    </button>
                    <button onClick={handleUploadAndSubmit} className="m3-btn-filled flex-[2] h-[48px]" disabled={isUploading}>
                      {isUploading ? '...' : 'Отправить'}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ) : showOutOfOrder ? (
            <motion.div
              key="out-of-order"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="m3-title-lg mb-2">Почему вне очереди?</div>
              <div className="flex flex-col gap-2">
                <button onClick={() => submitAdd(true, `${nextUser} не может сейчас`)} className="m3-btn-tonal justify-start !px-5 w-full h-[48px]">
                  {nextUser} не может сейчас
                </button>
                <button onClick={() => submitAdd(true, 'Меня попросили')} className="m3-btn-tonal justify-start !px-5 w-full h-[48px]">
                  Меня попросили
                </button>
                <button onClick={() => submitAdd(true, 'Срочно нужно было сделать')} className="m3-btn-tonal justify-start !px-5 w-full h-[48px]">
                  Срочно нужно было сделать
                </button>
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="Другая причина..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    className="m3-text-field-outlined flex-1 h-[48px]"
                  />
                  <button onClick={() => submitAdd(true, customReason || 'Другая причина')} className="m3-btn-filled h-[48px]">
                    ОК
                  </button>
                </div>
              </div>
              <button onClick={() => setShowOutOfOrder(false)} className="m3-btn-text mt-4">
                Отмена
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="status"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className={cn(
                "m3-headline-sm font-bold tracking-tight uppercase mb-3"
              )}>
                {isMyTurn ? 'ТЫ СЛЕДУЮЩИЙ' : (
                  <div className="flex items-center gap-2">
                    СЛЕДУЮЩИЙ: 
                    <UserAvatar user={nextUser} avatarUrl={avatars[nextUser]} className="w-8 h-8 text-sm normal-case tracking-normal" />
                    {nextUser}
                  </div>
                )}
              </div>
              {lastEntry && (
                <div className={cn(
                  "m3-body-lg",
                  isMyTurn ? "opacity-80" : "text-[var(--color-md-sys-color-on-surface-variant)]"
                )}>
                  Последний раз: {formatRelativeDate(lastEntry.date)}, {lastEntry.timeValue}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
 
      {!showOutOfOrder && !showProofOptions && (
        <button
          onClick={handleAdd}
          disabled={isSuccess || isUploading}
          className={cn(
            isMyTurn ? "m3-btn-filled w-full h-[56px] text-[18px]" : "m3-btn-tonal w-full h-[56px] text-[18px]",
            (isSuccess || isUploading) && "opacity-50 pointer-events-none"
          )}
        >
          {isUploading ? '...' : buttonText}
        </button>
      )}
      </div>
    </div>
  );
}
, (prev, next) => {
  if (prev.id !== next.id) return false;
  if (prev.currentUser !== next.currentUser) return false;
  if (prev.avatars !== next.avatars) return false;
  const prevEntries = prev.entries.filter(e => e.taskType === prev.id);
  const nextEntries = next.entries.filter(e => e.taskType === next.id);
  if (prevEntries.length !== nextEntries.length) return false;
  for (let i = 0; i < prevEntries.length; i++) {
    if (prevEntries[i].id !== nextEntries[i].id) return false;
  }
  return true;
});