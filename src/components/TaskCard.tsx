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
        "p-6 sm:p-8 rounded-[28px] transition-all relative overflow-hidden",
        isMyTurn 
          ? "bg-[var(--color-md-secondary-container)] text-[var(--color-md-on-secondary-container)]" 
          : "bg-[var(--color-md-surface)] border border-[var(--color-md-surface-variant)] text-[#E6E0E9]"
      )}
    >
      <div className="flex items-center gap-4 mb-6">
        <span className="text-4xl">{icon}</span>
        <h2 className="text-2xl font-medium tracking-tight">{title}</h2>
      </div>
      
      <div className="mb-8 min-h-[5rem] flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-[#6DD58C]"
            >
              <div className="text-2xl font-medium flex items-center gap-3 mb-2">
                <Check size={32} strokeWidth={2} />
                Готово
              </div>
              <div className="text-[#CAC4D0] font-normal text-sm mt-2">
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
              <div className="font-medium text-lg mb-2 text-[#E6E0E9]">Почему вне очереди?</div>
              <div className="flex flex-col gap-2">
                <button onClick={() => submitAdd(true, `${nextUser} не может сейчас`)} className="text-left px-5 py-3.5 rounded-[16px] bg-[var(--color-md-surface-variant)] hover:bg-[#5C5763] text-[#E6E0E9] text-base font-medium transition-colors">
                  {nextUser} не может сейчас
                </button>
                <button onClick={() => submitAdd(true, 'Меня попросили')} className="text-left px-5 py-3.5 rounded-[16px] bg-[var(--color-md-surface-variant)] hover:bg-[#5C5763] text-[#E6E0E9] text-base font-medium transition-colors">
                  Меня попросили
                </button>
                <button onClick={() => submitAdd(true, 'Срочно нужно было сделать')} className="text-left px-5 py-3.5 rounded-[16px] bg-[var(--color-md-surface-variant)] hover:bg-[#5C5763] text-[#E6E0E9] text-base font-medium transition-colors">
                  Срочно нужно было сделать
                </button>
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="Другая причина..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    className="flex-1 px-5 py-3.5 rounded-[16px] bg-[var(--color-md-surface-variant)] text-[#E6E0E9] placeholder-[#CAC4D0] border-none focus:ring-1 focus:ring-[var(--color-md-primary)] text-base outline-none transition-all"
                  />
                  <button onClick={() => submitAdd(true, customReason || 'Другая причина')} className="px-6 py-3.5 rounded-[16px] bg-[var(--color-md-primary)] hover:bg-[#EADDFF] text-[var(--color-md-on-primary)] font-medium text-base transition-colors">
                    ОК
                  </button>
                </div>
              </div>
              <button onClick={() => setShowOutOfOrder(false)} className="mt-4 px-4 py-2 text-sm text-[var(--color-md-primary)] font-medium transition-colors hover:bg-[var(--color-md-surface-variant)] rounded-[100px] w-fit">
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
                "text-2xl font-bold tracking-tight uppercase mb-3",
                isMyTurn ? "text-[var(--color-md-on-secondary-container)]" : "text-[#E6E0E9]"
              )}>
                {isMyTurn ? 'ТЫ СЛЕДУЮЩИЙ' : `СЛЕДУЮЩИЙ: ${nextUser}`}
              </div>
              {lastEntry && (
                <div className={cn(
                  "font-normal text-base",
                  isMyTurn ? "text-[var(--color-md-on-secondary-container)] opacity-80" : "text-[#CAC4D0]"
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
            "w-full py-5 px-6 rounded-[100px] font-medium text-lg flex items-center justify-center gap-3 transition-colors active:scale-[0.98]",
            isMyTurn
              ? "bg-[var(--color-md-primary)] text-[var(--color-md-on-primary)] hover:bg-[#EADDFF]"
              : "bg-[var(--color-md-surface-variant)] text-[#E6E0E9] hover:bg-[#5C5763]",
            isSuccess && "opacity-50 pointer-events-none"
          )}
        >
          {buttonText}
        </button>
      )}
    </div>
  );
}
