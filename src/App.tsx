import React, { useState, useEffect } from 'react';
import { api } from './api';
import { Entry, UserName, TaskType } from './types';
import { getSortedEntries, getMoscowDateString, getMoscowTimeString } from './utils';
import { UserSelector } from './components/UserSelector';
import { HistoryList } from './components/HistoryList';
import { TaskCard } from './components/TaskCard';
import { LogOut, History, ArrowLeft } from 'lucide-react';
import { cn } from './lib/utils';

const TASKS = [
  { id: 'trash' as TaskType, title: 'Мусор', icon: '🗑️', buttonText: 'Я вынес' },
  { id: 'dishwasher' as TaskType, title: 'Посудомойка', icon: '🍽️', buttonText: 'Я загрузил' },
];

export default function App() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [currentUser, setCurrentUser] = useState<UserName | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const user = await api.me();
      if (user) {
        setCurrentUser(user as UserName);
        const loadedEntries = await api.getEntries();
        setEntries(getSortedEntries(loadedEntries));
      }
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleLogin = async (user: UserName, password?: string) => {
    if (!password) return;
    const success = await api.login(user, password);
    if (success) {
      setCurrentUser(user);
      const loadedEntries = await api.getEntries();
      setEntries(getSortedEntries(loadedEntries));
    } else {
      alert("Неверный пароль");
    }
  };

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
  };

  const handleQuickAdd = async (taskId: TaskType, isOutOfOrder: boolean = false, reason?: string) => {
    if (!currentUser) return;
    
    const newEntry = {
      taskType: taskId,
      user: currentUser,
      date: getMoscowDateString(),
      timeType: 'exact' as const,
      timeValue: getMoscowTimeString(),
      isOutOfOrder,
      outOfOrderReason: reason
    };
    
    await api.addEntry(newEntry);
    const updatedEntries = await api.getEntries();
    setEntries(getSortedEntries(updatedEntries));
  };

  const handleDeleteEntry = async (id: string) => {
    await api.deleteEntry(id);
    const updatedEntries = await api.getEntries();
    setEntries(getSortedEntries(updatedEntries));
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-[var(--color-md-on-surface-variant)]">Загрузка...</div>;
  }

  if (!currentUser) {
    return <UserSelector onSelect={handleLogin} />;
  }

  return (
    <div className="min-h-[100dvh] pb-20 sm:pb-8 flex flex-col bg-[var(--color-md-bg)] text-[#E6E0E9]">
      <header className="sticky top-0 z-30 bg-[var(--color-md-bg)]/80 backdrop-blur-md border-b border-[var(--color-md-surface-variant)]">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center font-medium text-base",
              currentUser === 'Артём' ? "bg-[var(--color-artem-container)] text-[var(--color-artem-accent)]" : "bg-[var(--color-maxim-container)] text-[var(--color-maxim-accent)]"
            )}>
              {currentUser.charAt(0)}
            </div>
            <span className="font-medium">{currentUser}</span>
          </div>
          
          <button 
            onClick={handleLogout}
            className="p-2 text-[#CAC4D0] hover:bg-[var(--color-md-surface-variant)] rounded-full transition-colors active:scale-95"
            title="Выйти"
          >
            <LogOut size={22} strokeWidth={2} />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-8 space-y-8 flex-1 w-full">
        {!showHistory ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              {TASKS.map(task => (
                <TaskCard
                  key={task.id}
                  id={task.id}
                  title={task.title}
                  icon={task.icon}
                  entries={entries}
                  currentUser={currentUser}
                  onAdd={handleQuickAdd}
                  buttonText={task.buttonText}
                />
              ))}
            </div>

            <div className="flex justify-center mt-12">
              <button
                onClick={() => setShowHistory(true)}
                className="flex items-center gap-2 px-6 py-4 rounded-[100px] font-medium text-base text-[var(--color-md-primary)] hover:bg-[var(--color-md-surface-variant)] transition-colors active:scale-95"
              >
                <History size={20} />
                История записей
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowHistory(false)}
                className="p-2 -ml-2 rounded-full text-[#CAC4D0] hover:bg-[var(--color-md-surface-variant)] transition-colors active:scale-95"
              >
                <ArrowLeft size={24} />
              </button>
              <h1 className="text-xl font-medium tracking-tight">История</h1>
            </div>
            
            <HistoryList
              entries={entries}
              tasks={TASKS}
              onDelete={handleDeleteEntry}
            />
            
            <div className="pt-8 mt-8 border-t border-[var(--color-md-surface-variant)]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {TASKS.map(task => (
                  <div key={task.id} className="bg-[var(--color-md-surface)] rounded-[20px] p-5 flex items-center justify-between border border-[var(--color-md-surface-variant)]">
                    <div className="flex items-center gap-3 font-medium text-lg">
                      <span className="text-2xl">{task.icon}</span> {task.title}
                    </div>
                    <div className="flex gap-4 text-base font-normal">
                      <div className="text-[var(--color-artem-accent)]">А: {entries.filter(e => e.taskType === task.id && e.user === 'Артём').length}</div>
                      <div className="text-[var(--color-maxim-accent)]">М: {entries.filter(e => e.taskType === task.id && e.user === 'Максим').length}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
