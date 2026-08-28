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
        "p-6 sm:p-8 rounded-[2rem] border-2 transition-all relative overflow-hidden",
        isMyTurn 
          ? "border-blue-500/30 bg-blue-50 dark:border-blue-500/20 dark:bg-blue-900/10 shadow-lg shadow-blue-500/10" 
          : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900"
      )}
    >
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl sm:text-4xl">{icon}</span>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight uppercase">{title}</h2>
      </div>
      
      <div className="mb-8 min-h-[5rem] flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-green-600 dark:text-green-400"
            >
              <div className="text-2xl font-bold flex items-center gap-2 mb-1">
                <Check size={28} />
                Готово
              </div>
              <div className="text-slate-500 dark:text-slate-400 font-medium uppercase tracking-widest text-sm mt-2">
                СЛЕДУЮЩИЙ: {nextUser}
              </div>
            </motion.div>
          ) : showOutOfOrder ? (
            <motion.div
              key="out-of-order"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <div className="font-bold text-lg mb-2">Почему вне очереди?</div>
              <div className="grid grid-cols-1 gap-2">
                <button onClick={() => submitAdd(true, `${nextUser} не может сейчас`)} className="text-left px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm font-medium transition-colors">
                  {nextUser} не может сейчас
                </button>
                <button onClick={() => submitAdd(true, 'Меня попросили')} className="text-left px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm font-medium transition-colors">
                  Меня попросили
                </button>
                <button onClick={() => submitAdd(true, 'Срочно нужно было сделать')} className="text-left px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm font-medium transition-colors">
                  Срочно нужно было сделать
                </button>
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    placeholder="Другая причина..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-blue-500 text-sm outline-none"
                  />
                  <button onClick={() => submitAdd(true, customReason || 'Другая причина')} className="px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors">
                    ОК
                  </button>
                </div>
              </div>
              <button onClick={() => setShowOutOfOrder(false)} className="mt-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
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
                "text-2xl sm:text-3xl font-black tracking-tight uppercase mb-2",
                isMyTurn ? "text-blue-600 dark:text-blue-400" : ""
              )}>
                {isMyTurn ? 'ТЫ СЛЕДУЮЩИЙ' : `СЛЕДУЮЩИЙ: ${nextUser}`}
              </div>
              {lastEntry && (
                <div className="text-slate-500 dark:text-slate-400 font-medium">
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
            "w-full py-4 px-6 rounded-2xl font-bold text-xl flex items-center justify-center gap-3 transition-transform active:scale-[0.98]",
            isMyTurn
              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25"
              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700",
            isSuccess && "opacity-50 pointer-events-none"
          )}
        >
          {buttonText}
        </button>
      )}
    </div>
  );
}
