import React, { useState } from 'react';
import { Entry, TaskType, UserName } from '../types';
import { getLastEntry, getNextUser, formatRelativeDate } from '../utils';
import { cn } from '../lib/utils';
import { Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TaskCardProps {
  key?: React.Key;
  id: TaskType;
  title: string;
  icon: string;
  entries: Entry[];
  currentUser: UserName;
  onAdd: (taskId: TaskType, isOutOfOrder: boolean, reason?: string) => Promise<void>;
  buttonText: string;
}

export function TaskCard({ id, title, icon, entries, currentUser, onAdd, buttonText }: TaskCardProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [showOutOfOrder, setShowOutOfOrder] = useState(false);
  const [customReason, setCustomReason] = useState('');
  
  const taskEntries = entries.filter(e => e.taskType === id);
  const lastEntry = getLastEntry(taskEntries);
  const nextUser = getNextUser(taskEntries);
  const isMyTurn = nextUser === currentUser;

  const handleAdd = async () => {
    if (!isMyTurn) {
      setShowOutOfOrder(true);
      return;
    }
    await submitAdd(false);
  };

  const submitAdd = async (isOutOfOrder: boolean, reason?: string) => {
    setShowOutOfOrder(false);
    await onAdd(id, isOutOfOrder, reason);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
    }, 3000);
  };

  return (
    <div 
      className={cn(
        "p-6 sm:p-8 transition-all relative overflow-hidden",
        isMyTurn 
          ? "bg-[var(--color-md-sys-color-secondary-container)] text-[var(--color-md-sys-color-on-secondary-container)] rounded-[24px] shadow-sm" 
          : "m3-card-outlined rounded-[24px]"
      )}
    >
      <div className="flex items-center gap-4 mb-6">
        <img src={icon} alt={title} className="w-20 h-20 object-contain [image-rendering:pixelated] pointer-events-none select-none" />
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
              <div className="m3-label-md mt-2 opacity-80 uppercase tracking-widest">
                СЛЕДУЮЩИЙ: {nextUser}
              </div>
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
                {isMyTurn ? 'ТЫ СЛЕДУЮЩИЙ' : `СЛЕДУЮЩИЙ: ${nextUser}`}
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

      {!showOutOfOrder && (
        <button
          onClick={handleAdd}
          disabled={isSuccess}
          className={cn(
            isMyTurn ? "m3-btn-filled w-full h-[56px] text-[18px]" : "m3-btn-tonal w-full h-[56px] text-[18px]",
            isSuccess && "opacity-50 pointer-events-none"
          )}
        >
          {buttonText}
        </button>
      )}
    </div>
  );
}
