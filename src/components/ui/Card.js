import React from 'react';
import { cn } from '@/lib/utils/cn.js';

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn('bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div className={cn('p-5 border-b border-slate-100', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }) {
  return (
    <h3 className={cn('text-base font-semibold text-slate-900 leading-snug', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }) {
  return (
    <p className={cn('text-xs text-slate-500 mt-1', className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className, children, ...props }) {
  return (
    <div className={cn('p-5', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }) {
  return (
    <div className={cn('p-5 pt-0 flex items-center justify-between', className)} {...props}>
      {children}
    </div>
  );
}
