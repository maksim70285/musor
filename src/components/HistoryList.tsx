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
    <div className="space-y-8 mt-6">
      {tasks.map(task => {
        const taskEntries = entries.filter(e => e.taskType === task.id);
        
        if (taskEntries.length === 0) return null;

        return (
          <div key={task.id} className="space-y-4">
            <h3 className="text-xl font-medium flex items-center gap-3">
              <span className="text-2xl">{task.icon}</span> {task.title}
            </h3>
            
            <div className="bg-[var(--color-md-surface)] border border-[var(--color-md-surface-variant)] rounded-[24px] overflow-hidden">
              {taskEntries.map((entry, index) => (
                <div 
                  key={entry.id}
                  className={cn(
                    "flex items-center justify-between px-5 py-4",
                    index !== taskEntries.length - 1 ? "border-b border-[var(--color-md-surface-variant)]" : ""
                  )}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-3 text-base font-normal">
                      <span className="text-[#CAC4D0] w-12">{formatShortDate(entry.date).slice(0, 5)}</span>
                      <span className="text-[var(--color-md-surface-variant)]">—</span>
                      <span className={cn(
                        "font-medium",
                        entry.user === 'Артём' ? "text-[var(--color-artem-accent)]" : "text-[var(--color-maxim-accent)]"
                      )}>
                        {entry.user}
                      </span>
                      <span className="text-[var(--color-md-surface-variant)]">—</span>
                      <span className="text-[#E6E0E9]">{entry.timeValue}</span>
                    </div>
                    {entry.isOutOfOrder && (
                      <div className="text-sm text-[var(--color-md-error)] mt-1 pl-[4.5rem]">
                        ВНЕ ОЧЕРЕДИ • {entry.outOfOrderReason}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity [&:not(:hover)]:sm:opacity-0 [&:not(:hover)]:opacity-100">
                    <button onClick={() => {
                        if (window.confirm('Удалить эту запись?')) onDelete(entry.id);
                      }} 
                      className="p-2.5 text-[#CAC4D0] hover:text-[var(--color-md-error)] hover:bg-[var(--color-md-surface-variant)] rounded-full transition-colors active:scale-95"
                      title="Удалить"
                    >
                      <Trash2 size={20} strokeWidth={2} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      
      {entries.length === 0 && (
        <div className="text-center py-12 text-[#CAC4D0] text-lg">
          Записей пока нет.
        </div>
      )}
    </div>
  );
}
