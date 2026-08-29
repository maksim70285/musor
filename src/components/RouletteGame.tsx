import React, { useState, useEffect } from 'react';
import { Roulette } from '../types';
import { api } from '../api';
import { ArrowLeft, Plus, Trash2, Dices, Save } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

import { Socket } from 'socket.io-client';
import { SpinData } from './Chat';

interface RouletteGameProps {
  onClose: () => void;
  socket: Socket | null;
  currentSpin: SpinData | null;
}

export function RouletteGame({ onClose, socket, currentSpin }: RouletteGameProps) {
  const [roulettes, setRoulettes] = useState<Roulette[]>([]);
  const [activeRoulette, setActiveRoulette] = useState<Roulette | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  // Edit mode
  const [editName, setEditName] = useState('');
  const [editOptions, setEditOptions] = useState<string[]>([]);
  const [newOptionText, setNewOptionText] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadRoulettes();
  }, []);

  useEffect(() => {
    if (currentSpin && roulettes.length > 0) {
      const r = roulettes.find(r => r.id === currentSpin.rouletteId);
      if (r) {
        setActiveRoulette(r);
        setIsEditing(false);
        
        const elapsed = Date.now() - currentSpin.timestamp;
        const remaining = currentSpin.spinDuration - elapsed;
        
        if (remaining > 0) {
          setIsSpinning(true);
          setResult(null);
          
          const timer = setTimeout(() => {
            setResult(currentSpin.result);
            setIsSpinning(false);
          }, remaining);
          
          return () => clearTimeout(timer);
        } else {
          setIsSpinning(false);
          setResult(currentSpin.result);
        }
      }
    }
  }, [currentSpin, roulettes]);

  const loadRoulettes = async () => {
    const data = await api.getRoulettes();
    setRoulettes(data);
  };

  const handleCreateNew = () => {
    setEditName('Новая рулетка');
    setEditOptions(['Вариант 1', 'Вариант 2']);
    setIsEditing(true);
    setActiveRoulette(null);
  };

  const handleEdit = (r: Roulette) => {
    setEditName(r.name);
    setEditOptions(r.options);
    setIsEditing(true);
    setActiveRoulette(r);
  };

  const handleSave = async () => {
    if (!editName.trim() || editOptions.length < 2) return;
    const r = {
      id: activeRoulette?.id || '',
      name: editName.trim(),
      options: editOptions
    };
    await api.saveRoulette(r);
    setIsEditing(false);
    await loadRoulettes();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Удалить рулетку?")) return;
    await api.deleteRoulette(id);
    if (activeRoulette?.id === id) setActiveRoulette(null);
    await loadRoulettes();
  };

  const handleAddOption = () => {
    if (!newOptionText.trim()) return;
    setEditOptions([...editOptions, newOptionText.trim()]);
    setNewOptionText('');
  };

  const handleRemoveOption = (index: number) => {
    setEditOptions(editOptions.filter((_, i) => i !== index));
  };

  const spin = () => {
    if (!activeRoulette || activeRoulette.options.length === 0 || isSpinning || !socket) return;
    setIsSpinning(true);
    setResult(null);
    socket.emit('spin_roulette', {
      rouletteId: activeRoulette.id,
      options: activeRoulette.options
    });
  };

  return (
    <div className="flex flex-col h-full bg-[var(--color-md-sys-color-background)]">
      <header className="sticky top-0 z-30 bg-[var(--color-md-sys-color-background)]/80 backdrop-blur-md border-b border-[var(--color-md-sys-color-surface-variant)]">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={isEditing ? () => setIsEditing(false) : onClose}
              className="m3-icon-btn -ml-2"
            >
              <ArrowLeft size={24} strokeWidth={1.5} />
            </button>
            <h1 className="m3-title-lg">{isEditing ? 'Редактирование' : 'Рулетка'}</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 max-w-4xl mx-auto w-full space-y-6">
        {isEditing ? (
          <div className="space-y-6">
            <input
              type="text"
              value={editName}
              onChange={e => setEditName(e.target.value)}
              className="m3-text-field-outlined"
              placeholder="Название рулетки"
            />

            <div className="space-y-3">
              <div className="m3-title-md text-[var(--color-md-sys-color-on-surface-variant)]">Варианты</div>
              {editOptions.map((opt, i) => (
                <div key={i} className="flex items-center gap-2 m3-card-outlined p-3">
                  <div className="flex-1 m3-body-lg text-[var(--color-md-sys-color-on-surface)]">{opt}</div>
                  <button onClick={() => handleRemoveOption(i)} className="text-[var(--color-md-sys-color-error)] m3-icon-btn">
                    <Trash2 size={20} strokeWidth={1.5} />
                  </button>
                </div>
              ))}
              
              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={newOptionText}
                  onChange={e => setNewOptionText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddOption()}
                  placeholder="Добавить вариант..."
                  className="flex-1 m3-text-field-outlined !h-12"
                />
                <button onClick={handleAddOption} disabled={!newOptionText.trim()} className="m3-btn-tonal h-12">
                  <Plus size={20} strokeWidth={1.5} />
                </button>
              </div>
            </div>

            <div className="pt-6">
              <button 
                onClick={handleSave} 
                disabled={!editName.trim() || editOptions.length < 2}
                className="m3-btn-filled w-full h-14 text-lg"
              >
                Сохранить
              </button>
            </div>
          </div>
        ) : !activeRoulette ? (
          <div className="space-y-4">
            {roulettes.length === 0 ? (
              <div className="text-center py-12 m3-body-lg text-[var(--color-md-sys-color-on-surface-variant)]">
                Нет сохранённых рулеток.
              </div>
            ) : (
              <div className="grid gap-3">
                {roulettes.map(r => (
                  <div key={r.id} className="m3-card-outlined p-4 flex items-center justify-between">
                    <button 
                      className="flex-1 text-left m3-title-md text-[var(--color-md-sys-color-on-surface)]"
                      onClick={() => setActiveRoulette(r)}
                    >
                      {r.name}
                    </button>
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(r)} className="m3-btn-text !px-3">
                        Изменить
                      </button>
                      <button onClick={() => handleDelete(r.id)} className="m3-icon-btn text-[var(--color-md-sys-color-error)]">
                        <Trash2 size={20} strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button onClick={handleCreateNew} className="m3-btn-tonal w-full h-14 mt-4">
              Создать новую рулетку
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-12">
            <h2 className="m3-headline-md text-center">{activeRoulette.name}</h2>
            
            <div className="relative w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center">
              <motion.div
                animate={{ rotate: isSpinning ? 1440 : 0 }}
                transition={{ duration: 2, ease: "circOut" }}
                className="w-full h-full rounded-full border-4 border-[var(--color-md-sys-color-primary)] bg-[var(--color-md-sys-color-surface-container-highest)] flex items-center justify-center shadow-lg"
              >
                <Dices size={64} className="text-[var(--color-md-sys-color-primary)] opacity-50" />
              </motion.div>
              
              <AnimatePresence>
                {result && (
                  <motion.div 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute inset-0 m3-card-filled bg-[var(--color-md-sys-color-primary)] text-[var(--color-md-sys-color-on-primary)] flex items-center justify-center text-center p-4 shadow-xl z-10 rounded-full"
                  >
                    <div className="m3-headline-sm font-bold">{result}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex gap-4 w-full">
              <button onClick={() => setActiveRoulette(null)} className="m3-btn-tonal flex-1 h-14">
                К списку
              </button>
              <button onClick={spin} disabled={isSpinning} className="m3-btn-filled flex-1 h-14 text-lg">
                Крутить
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
