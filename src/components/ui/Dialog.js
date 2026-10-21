'use client';

import React, { useEffect } from 'react';
import { cn } from '@/lib/utils/cn.js';
import { X } from 'lucide-react';

export function Dialog({
  isOpen,
  open,
  onClose,
  title,
  description,
  children,
  maxWidth = 'max-w-lg',
  className
}) {
  const show = open !== undefined ? open : isOpen;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) onClose();
    };
    if (show) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog Content */}
      <div
        className={cn(
          'relative w-full bg-white rounded-xl shadow-xl border border-slate-200 z-10 overflow-hidden flex flex-col max-h-[90vh]',
          maxWidth,
          className
        )}
      >
        {/* Render header if title prop was passed directly */}
        {(title || description) && (
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <div>
              {title && <h3 className="text-base font-semibold text-slate-900">{title}</h3>}
              {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        <div className="p-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export function DialogHeader({ className, children, ...props }) {
  return (
    <div className={cn('flex flex-col space-y-1.5 pb-4 border-b border-slate-100', className)} {...props}>
      {children}
    </div>
  );
}

export function DialogTitle({ className, children, ...props }) {
  return (
    <h3 className={cn('text-base font-semibold text-slate-900 tracking-tight', className)} {...props}>
      {children}
    </h3>
  );
}

export function DialogDescription({ className, children, ...props }) {
  return (
    <p className={cn('text-xs text-slate-500', className)} {...props}>
      {children}
    </p>
  );
}

export function DialogContent({ className, children, ...props }) {
  return (
    <div className={cn('py-4', className)} {...props}>
      {children}
    </div>
  );
}

export function DialogFooter({ className, children, ...props }) {
  return (
    <div className={cn('flex flex-wrap items-center justify-end gap-2 pt-4 border-t border-slate-100 mt-4', className)} {...props}>
      {children}
    </div>
  );
}
