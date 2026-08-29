import React, { useState } from 'react';
import { Entry, TaskType } from '../types';
import { formatShortDate } from '../utils';
import { Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { MediaViewer } from './MediaViewer';

interface HistoryListProps {
  entries: Entry[];
  tasks: { id: TaskType; title: string; icon: string }[];
  onDelete: (id: string) => void;
}

export function HistoryList({ entries, tasks, onDelete }: HistoryListProps) {
  const [viewingMedia, setViewingMedia] = useState<{url: string, type: 'image' | 'video'} | null>(null);

  return (
    <div className="space-y-8 mt-6">
      {tasks.map(task => {
        const taskEntries = entries.filter(e => e.taskType === task.id);
        
        if (taskEntries.length === 0) return null;

        return (
          <div key={task.id} className="space-y-4">
            <h3 className="m3-title-lg flex items-center gap-3">
              <img src={task.icon} alt={task.title} className="w-16 h-16 object-contain [image-rendering:pixelated] pointer-events-none select-none" /> {task.title}
            </h3>
            
            <div className="m3-card-outlined overflow-hidden rounded-[24px]">
              {taskEntries.map((entry, index) => (
                <div 
                  key={entry.id}
                  className={cn(
                    "flex items-center justify-between px-5 py-4",
                    index !== taskEntries.length - 1 ? "border-b border-[var(--color-md-sys-color-outline-variant)]" : ""
                  )}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-3 m3-body-lg">
                      <span className="text-[var(--color-md-sys-color-on-surface-variant)] w-12">{formatShortDate(entry.date).slice(0, 5)}</span>
                      <span className="text-[var(--color-md-sys-color-outline-variant)]">—</span>
                      <span className={cn(
                        "m3-title-md",
                        entry.user === 'Артём' ? "text-[var(--color-artem-accent)]" : "text-[var(--color-maxim-accent)]"
                      )}>
                        {entry.user}
                      </span>
                      <span className="text-[var(--color-md-sys-color-outline-variant)]">—</span>
                      <span className="text-[var(--color-md-sys-color-on-surface)]">{entry.timeValue}</span>
                    </div>
                    {entry.isOutOfOrder && (
                      <div className="m3-body-md text-[var(--color-md-sys-color-error)] mt-1 pl-[4.5rem]">
                        ВНЕ ОЧЕРЕДИ • {entry.outOfOrderReason}
                      </div>
                    )}
                    {entry.fileUrl && entry.fileType && (
                      <div className="mt-1 pl-[4.5rem]">
                        <button
                          onClick={() => setViewingMedia({ url: entry.fileUrl!, type: entry.fileType! })}
                          className="m3-btn-text !h-8 !px-3 !text-sm text-[var(--color-md-sys-color-primary)]"
                        >
                          Доказательство
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity [&:not(:hover)]:sm:opacity-0 [&:not(:hover)]:opacity-100">
                    <button onClick={() => {
                        if (window.confirm('Удалить эту запись?')) onDelete(entry.id);
                      }} 
                      className="m3-icon-btn hover:text-[var(--color-md-sys-color-error)]"
                      title="Удалить"
                    >
                      <Trash2 size={24} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      
      {entries.length === 0 && (
        <div className="text-center py-12 text-[var(--color-md-sys-color-on-surface-variant)] m3-body-lg">
          Записей пока нет.
        </div>
      )}

      {viewingMedia && (
        <MediaViewer 
          url={viewingMedia.url} 
          type={viewingMedia.type} 
          onClose={() => setViewingMedia(null)} 
        />
      )}
    </div>
  );
}
