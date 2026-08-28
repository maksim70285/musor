import React from 'react';
import { Entry, TaskType } from '../types';
import { formatShortDate } from '../utils';
import { Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface HistoryListProps {
  entries: Entry[];
  tasks: { id: TaskType; title: string; icon: string }[];
  onDelete: (id: string) => void;
}

export function HistoryList({ entries, tasks, onDelete }: HistoryListProps) {
  return (
    <div className="space-y-8">
      {tasks.map(task => {
        const taskEntries = entries.filter(e => e.taskType === task.id);
        
        if (taskEntries.length === 0) return null;

        return (
          <div key={task.id} className="space-y-3">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
              <span>{task.icon}</span> {task.title}
            </h3>
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
              {taskEntries.map((entry, index) => (
                <div 
                  key={entry.id}
                  className={cn(
                    "flex items-center justify-between p-4",
                    index !== taskEntries.length - 1 ? "border-b border-slate-100 dark:border-slate-800" : ""
                  )}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2 text-sm sm:text-base font-medium">
                      <span className="text-slate-500 w-12">{formatShortDate(entry.date).slice(0, 5)}</span>
                      <span className="text-slate-700 dark:text-slate-600">—</span>
                      <span className={entry.user === 'Артём' ? "text-blue-500" : "text-green-500"}>
                        {entry.user}
                      </span>
                      <span className="text-slate-700 dark:text-slate-600">—</span>
                      <span className="text-slate-400">{entry.timeValue}</span>
                    </div>
                    {entry.isOutOfOrder && (
                      <div className="text-xs text-amber-500/80 mt-1 pl-16">
                        ВНЕ ОЧЕРЕДИ • {entry.outOfOrderReason}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity [&:not(:hover)]:sm:opacity-0 [&:not(:hover)]:opacity-100">
                    <button onClick={() => {
                        if (window.confirm('Удалить эту запись?')) onDelete(entry.id);
                      }} 
                      className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Удалить"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      
      {entries.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          Записей пока нет.
        </div>
      )}
    </div>
  );
}
