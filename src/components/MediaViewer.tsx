import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MediaViewerProps {
  url: string;
  type: 'image' | 'video';
  onClose: () => void;
}

export function MediaViewer({ url, type, onClose }: MediaViewerProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
        onClick={onClose}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white p-2 bg-black/50 rounded-full"
        >
          <X size={24} />
        </button>
        <div className="max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
          {type === 'image' ? (
            <img src={url} alt="Доказательство" className="max-w-full max-h-[80vh] object-contain" />
          ) : (
            <video preload="metadata" src={url} controls className="max-w-full max-h-[80vh]" />
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
