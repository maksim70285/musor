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
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto bg-[var(--color-md-sys-color-secondary-container)] text-[var(--color-md-sys-color-on-secondary-container)] mb-4 shadow-sm">
            {selectedUser ? <Lock size={48} strokeWidth={1.5} /> : <User size={48} strokeWidth={1.5} />}
          </div>
          <h1 className="m3-display-sm text-[var(--color-md-sys-color-on-background)]">Кто вы?</h1>
          <p className="m3-body-lg text-[var(--color-md-sys-color-on-surface-variant)]">
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
                    "group flex items-center justify-between p-5 text-left m3-card-outlined w-full"
                  )}
                >
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-[var(--color-artem-container)] flex items-center justify-center text-[var(--color-artem-accent)] m3-title-lg">
                      А
                    </div>
                    <div>
                      <div className="m3-title-md text-[var(--color-md-sys-color-on-surface)]">Я — Артём</div>
                    </div>
                  </div>
                  <ArrowRight className="text-[var(--color-md-sys-color-on-surface-variant)] group-hover:text-[var(--color-artem-accent)] transition-colors relative z-10" />
                </button>

                <button
                  onClick={() => handleUserClick('Максим')}
                  className={cn(
                    "group flex items-center justify-between p-5 text-left m3-card-outlined w-full"
                  )}
                >
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-[var(--color-maxim-container)] flex items-center justify-center text-[var(--color-maxim-accent)] m3-title-lg">
                      М
                    </div>
                    <div>
                      <div className="m3-title-md text-[var(--color-md-sys-color-on-surface)]">Я — Максим</div>
                    </div>
                  </div>
                  <ArrowRight className="text-[var(--color-md-sys-color-on-surface-variant)] group-hover:text-[var(--color-maxim-accent)] transition-colors relative z-10" />
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
                <div className="relative pt-2">
                  <input
                    type="password"
                    placeholder={isNewUser ? "Придумайте пароль" : "Пароль"}
                    autoFocus
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="m3-text-field-outlined text-center tracking-widest font-mono m3-headline-sm"
                  />
                </div>
                
                <div className="pt-4 flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={!password}
                    className="m3-btn-filled w-full h-[56px] disabled:opacity-30"
                  >
                    {isNewUser ? "Сохранить и войти" : "Войти"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedUser(null)}
                    className="m3-btn-text w-full h-[48px]"
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
