import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'md' | 'lg' | 'full';
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  size = 'md'
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-secondary/80 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className={`fixed inset-x-0 bottom-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 
              bg-white z-[101] flex flex-col max-h-[95vh] sm:max-h-[85vh] 
              ${size === 'full' ? 'h-full w-full sm:w-[95vw]' : size === 'lg' ? 'sm:w-[800px]' : 'sm:w-[500px]'}
              rounded-t-3xl sm:rounded-2xl shadow-[0_32px_64px_-12px_rgba(15,23,42,0.15)] overflow-hidden border border-line`}
          >
            <div className="px-6 py-5 border-b border-line flex justify-between items-center bg-white sticky top-0 z-10">
              <h3 className="text-xl font-bold tracking-tight text-primary">{title}</h3>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-bg rounded-full transition-all text-secondary hover:text-primary"
              >
                <X size={22} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-bg/30">
              {children}
            </div>
            
            {footer && (
              <div className="p-6 border-t border-line bg-white sticky bottom-0 z-10 flex gap-3">
                {footer}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
