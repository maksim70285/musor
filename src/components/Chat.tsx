import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, UserName, Roulette } from '../types';
import { api } from '../api';
import { ArrowLeft, Send, Image as ImageIcon, Video, Dices, Play } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { RouletteGame } from './RouletteGame';

interface ChatProps {
  currentUser: UserName;
  onClose: () => void;
}

export function Chat({ currentUser, onClose }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showRoulette, setShowRoulette] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load initial messages
    api.getMessages().then(setMessages);

    // Connect to WebSocket
    const socket = io({ path: '/socket.io' });
    socketRef.current = socket;

    socket.on('new_message', (msg: ChatMessage) => {
      setMessages(prev => {
        // Prevent duplicate if already in state
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim() && !isUploading) return;
    if (socketRef.current && inputText.trim()) {
      socketRef.current.emit('send_message', { user: currentUser, text: inputText.trim() });
      setInputText('');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      alert("Файл слишком большой (максимум 50 МБ)");
      return;
    }

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isVideo && !isImage) {
      alert("Только фото и видео");
      return;
    }

    setIsUploading(true);
    try {
      const fileUrl = await api.uploadFile(file);
      if (fileUrl && socketRef.current) {
        socketRef.current.emit('send_message', {
          user: currentUser,
          fileUrl,
          fileType: isVideo ? 'video' : 'image'
        });
      }
    } catch (err) {
      alert("Ошибка загрузки");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (showRoulette) {
    return <RouletteGame onClose={() => setShowRoulette(false)} />;
  }

  return (
    <div className="flex flex-col h-full bg-[var(--color-md-sys-color-background)]">
      <header className="sticky top-0 z-30 bg-[var(--color-md-sys-color-background)]/80 backdrop-blur-md border-b border-[var(--color-md-sys-color-surface-variant)]">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="m3-icon-btn -ml-2"
            >
              <ArrowLeft size={24} strokeWidth={1.5} />
            </button>
            <h1 className="m3-title-lg">Чат</h1>
          </div>
          <button
            onClick={() => setShowRoulette(true)}
            className="m3-icon-btn text-[var(--color-md-sys-color-primary)]"
            title="Рулетка"
          >
            <Dices size={24} strokeWidth={1.5} />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4 max-w-4xl mx-auto w-full">
        {messages.map((msg, index) => {
          const isMe = msg.user === currentUser;
          const showName = index === 0 || messages[index - 1].user !== msg.user;
          const time = new Date(msg.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("flex flex-col max-w-[85%]", isMe ? "ml-auto items-end" : "mr-auto items-start")}
            >
              {showName && (
                <div className="mb-1 m3-label-sm text-[var(--color-md-sys-color-on-surface-variant)] px-1">
                  {msg.user}
                </div>
              )}
              <div className={cn(
                "rounded-[20px] px-4 py-2.5 relative group overflow-hidden isolate",
                isMe
                  ? "bg-[var(--color-md-sys-color-primary-container)] text-[var(--color-md-sys-color-on-primary-container)] rounded-tr-[4px]"
                  : "bg-[var(--color-md-sys-color-surface-variant)] text-[var(--color-md-sys-color-on-surface-variant)] rounded-tl-[4px]"
              )}>
                {msg.text && <div className="m3-body-lg whitespace-pre-wrap break-words">{msg.text}</div>}
                {msg.fileUrl && (
                  <div className="mt-2 rounded-lg overflow-hidden border border-[var(--color-md-sys-color-outline-variant)]">
                    {msg.fileType === 'image' ? (
                      <a href={msg.fileUrl} target="_blank" rel="noreferrer">
                        <img src={msg.fileUrl} alt="Вложение" className="max-h-64 object-contain" />
                      </a>
                    ) : (
                      <video src={msg.fileUrl} controls className="max-h-64 object-contain" />
                    )}
                  </div>
                )}
                <div className={cn("text-[10px] opacity-70 mt-1 text-right", isMe ? "text-[var(--color-md-sys-color-on-primary-container)]" : "text-[var(--color-md-sys-color-on-surface-variant)]")}>
                  {time}
                </div>
              </div>
            </motion.div>
          );
        })}
        {isUploading && (
          <div className="text-center m3-label-md text-[var(--color-md-sys-color-on-surface-variant)] py-2">
            Загрузка...
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      <footer className="bg-[var(--color-md-sys-color-surface)] border-t border-[var(--color-md-sys-color-outline-variant)] p-4 pb-safe">
        <div className="max-w-4xl mx-auto flex items-end gap-2">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*,video/*"
            onChange={handleFileUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="m3-icon-btn shrink-0 text-[var(--color-md-sys-color-primary)]"
            title="Прикрепить"
          >
            <ImageIcon size={24} strokeWidth={1.5} />
          </button>
          
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Сообщение..."
            className="flex-1 bg-[var(--color-md-sys-color-surface-container-highest)] text-[var(--color-md-sys-color-on-surface)] rounded-[24px] px-5 py-3 outline-none resize-none m3-body-lg min-h-[48px] max-h-[120px]"
            rows={1}
          />
          
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className={cn(
              "m3-btn-filled shrink-0 w-12 h-12 !px-0 rounded-full transition-all",
              !inputText.trim() && "opacity-50"
            )}
          >
            <Send size={20} strokeWidth={1.5} className="ml-1" />
          </button>
        </div>
      </footer>
    </div>
  );
}
