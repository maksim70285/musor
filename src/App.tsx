import React, { useState, useEffect } from 'react';
import { api } from './api';
import { Entry, UserName, TaskType } from './types';
import { getSortedEntries, getMoscowDateString, getMoscowTimeString } from './utils';
import { UserSelector } from './components/UserSelector';
import { HistoryList } from './components/HistoryList';
import { TaskCard } from './components/TaskCard';
import { LogOut } from 'lucide-react';
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
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Загрузка...</div>;
  }

  if (!currentUser) {
    return <UserSelector onSelect={handleLogin} />;
  }

  return (
    <div className="min-h-screen pb-20 sm:pb-8">
      <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
              currentUser === 'Артём' ? "bg-blue-900/50 text-blue-300" : "bg-green-900/50 text-green-300"
            )}>
              {currentUser.charAt(0)}
            </div>
            <span className="font-semibold">{currentUser}</span>
          </div>
          
          <button 
            onClick={handleLogout}
            className="p-2 text-slate-500 hover:bg-slate-800 rounded-full transition-colors"
            title="Выйти"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-8">
        {!showHistory ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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

            <button
              onClick={() => setShowHistory(true)}
              className="w-full py-4 rounded-2xl font-semibold text-slate-500 bg-slate-800 hover:bg-slate-700 transition-colors mt-8"
            >
              История
            </button>
          </>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-sm font-bold uppercase tracking-widest text-slate-400">История</h1>
              <button
                onClick={() => setShowHistory(false)}
                className="px-4 py-2 rounded-xl font-semibold text-slate-500 bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Назад
              </button>
            </div>
            
            <HistoryList
              entries={entries}
              tasks={TASKS}
              onDelete={handleDeleteEntry}
            />
            
            <div className="pt-8 mt-8 border-t border-slate-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {TASKS.map(task => (
                  <div key={task.id} className="bg-slate-800/50 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold">
                      <span>{task.icon}</span> {task.title}
                    </div>
                    <div className="flex gap-4 text-sm font-medium">
                      <div className="text-slate-500">А: {entries.filter(e => e.taskType === task.id && e.user === 'Артём').length}</div>
                      <div className="text-slate-500">М: {entries.filter(e => e.taskType === task.id && e.user === 'Максим').length}</div>
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
