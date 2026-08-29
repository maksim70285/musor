import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserName } from '../types';
import { cn } from '../lib/utils';
import { User, ArrowRight, Lock } from 'lucide-react';
import { api } from '../api';

interface UserSelectorProps {
  onSelect: (user: UserName, password?: string) => void;
}

export function UserSelector({ onSelect }: UserSelectorProps) {
  const [selectedUser, setSelectedUser] = useState<UserName | null>(null);
  const [password, setPassword] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser && password) {
      onSelect(selectedUser, password);
    }
  };

  const handleUserClick = async (user: UserName) => {
    setSelectedUser(user);
    const hasPass = await api.checkPasswordStatus(user);
    setIsNewUser(!hasPass);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] p-6 max-w-md mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full text-center space-y-6"
      >
        <div className="space-y-4 mb-8">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto bg-[var(--color-md-secondary-container)] text-[var(--color-md-on-secondary-container)] mb-4">
            {selectedUser ? <Lock size={48} strokeWidth={1.5} /> : <User size={48} strokeWidth={1.5} />}
          </div>
          <h1 className="text-3xl font-normal tracking-tight text-[#E6E0E9]">Кто вы?</h1>
          <p className="text-[#CAC4D0] text-base font-normal">
            {selectedUser 
              ? (isNewUser ? `Придумайте пароль для входа (${selectedUser})` : `Введите пароль для ${selectedUser}`) 
              : 'Выберите свой профиль'}
          </p>
        </div>

        <div className="relative">
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
                  onClick={() => handleUserClick('Артём')}
                  className={cn(
                    "group relative flex items-center justify-between p-5 rounded-[28px]",
                    "bg-[var(--color-md-surface)] border border-[var(--color-md-surface-variant)]",
                    "hover:bg-[var(--color-md-surface-variant)] transition-colors",
                    "text-left overflow-hidden active:scale-[0.98]"
                  )}
                >
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-[var(--color-artem-container)] flex items-center justify-center text-[var(--color-artem-accent)] font-medium text-2xl">
                      А
                    </div>
                    <div>
                      <div className="font-normal text-xl text-[#E6E0E9]">Я — Артём</div>
                    </div>
                  </div>
                  <ArrowRight className="text-[#CAC4D0] group-hover:text-[var(--color-artem-accent)] transition-colors relative z-10" />
                </button>

                <button
                  onClick={() => handleUserClick('Максим')}
                  className={cn(
                    "group relative flex items-center justify-between p-5 rounded-[28px]",
                    "bg-[var(--color-md-surface)] border border-[var(--color-md-surface-variant)]",
                    "hover:bg-[var(--color-md-surface-variant)] transition-colors",
                    "text-left overflow-hidden active:scale-[0.98]"
                  )}
                >
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-[var(--color-maxim-container)] flex items-center justify-center text-[var(--color-maxim-accent)] font-medium text-2xl">
                      М
                    </div>
                    <div>
                      <div className="font-normal text-xl text-[#E6E0E9]">Я — Максим</div>
                    </div>
                  </div>
                  <ArrowRight className="text-[#CAC4D0] group-hover:text-[var(--color-maxim-accent)] transition-colors relative z-10" />
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
                <div className="relative">
                  <input
                    type="password"
                    placeholder={isNewUser ? "Придумайте пароль" : "Пароль"}
                    autoFocus
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 py-4 rounded-[16px] bg-[var(--color-md-surface)] border border-[var(--color-md-surface-variant)] focus:border-[var(--color-md-primary)] focus:ring-1 focus:ring-[var(--color-md-primary)] outline-none transition-all text-center text-xl tracking-widest font-mono text-[#E6E0E9]"
                  />
                </div>
                
                <div className="pt-4 flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={!password}
                    className="w-full py-4 rounded-[100px] bg-[var(--color-md-primary)] text-[var(--color-md-on-primary)] font-medium text-lg disabled:opacity-50 disabled:bg-[var(--color-md-surface-variant)] disabled:text-[#E6E0E9] transition-colors active:scale-[0.98]"
                  >
                    {isNewUser ? "Сохранить и войти" : "Войти"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedUser(null)}
                    className="w-full py-4 rounded-[100px] text-[var(--color-md-primary)] hover:bg-[var(--color-md-surface-variant)] font-medium transition-colors"
                  >
                    Назад
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
