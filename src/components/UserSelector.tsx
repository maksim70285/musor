import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserName } from '../types';
import { cn } from '../lib/utils';
import { User, ArrowRight, Lock } from 'lucide-react';

interface UserSelectorProps {
  onSelect: (user: UserName, password?: string) => void;
}

export function UserSelector({ onSelect }: UserSelectorProps) {
  const [selectedUser, setSelectedUser] = useState<UserName | null>(null);
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser && password) {
      onSelect(selectedUser, password);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 max-w-md mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full text-center space-y-8"
      >
        <div className="space-y-3">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-slate-800 text-slate-400">
            {selectedUser ? <Lock size={40} /> : <User size={40} />}
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Кто вы?</h1>
          <p className="text-slate-500 text-lg">
            {selectedUser ? `Введите пароль для ${selectedUser}` : 'Выберите свой профиль для входа'}
          </p>
        </div>

        <div className="mt-8 relative">
          <AnimatePresence mode="wait">
            {!selectedUser ? (
              <motion.div 
                key="select"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid gap-4"
              >
                <button
                  onClick={() => setSelectedUser('Артём')}
                  className={cn(
                    "group relative flex items-center justify-between p-6 rounded-2xl",
                    "bg-slate-800 border-2 border-slate-700",
                    "hover:border-blue-500 transition-all",
                    "text-left overflow-hidden active:scale-[0.98]"
                  )}
                >
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-900/50 flex items-center justify-center text-blue-400 font-bold text-xl">
                      А
                    </div>
                    <div>
                      <div className="font-semibold text-xl">Я — Артём</div>
                    </div>
                  </div>
                  <ArrowRight className="text-slate-500 group-hover:text-blue-500 transition-colors relative z-10" />
                </button>

                <button
                  onClick={() => setSelectedUser('Максим')}
                  className={cn(
                    "group relative flex items-center justify-between p-6 rounded-2xl",
                    "bg-slate-800 border-2 border-slate-700",
                    "hover:border-green-500 transition-all",
                    "text-left overflow-hidden active:scale-[0.98]"
                  )}
                >
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-900/50 flex items-center justify-center text-green-400 font-bold text-xl">
                      М
                    </div>
                    <div>
                      <div className="font-semibold text-xl">Я — Максим</div>
                    </div>
                  </div>
                  <ArrowRight className="text-slate-500 group-hover:text-green-500 transition-colors relative z-10" />
                </button>
              </motion.div>
            ) : (
              <motion.form 
                key="password"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <input
                  type="password"
                  placeholder="Пароль"
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-slate-800 border-2 border-slate-700 focus:border-blue-500 outline-none transition-colors text-center text-xl tracking-widest font-mono"
                />
                <button
                  type="submit"
                  disabled={!password}
                  className="w-full p-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg disabled:opacity-50 disabled:pointer-events-none transition-colors"
                >
                  Войти
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="w-full p-4 text-slate-500 hover:text-slate-300 font-medium transition-colors"
                >
                  Назад
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
