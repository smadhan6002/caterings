import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-primary text-white hover:bg-primary/90": variant === 'primary',
            "border border-gray-200 bg-white hover:bg-gray-100 text-gray-900": variant === 'outline',
            "hover:bg-gray-100 text-gray-900": variant === 'ghost',
            "h-9 px-4 text-sm": size === 'sm',
            "h-11 px-8 text-base": size === 'md',
            "h-14 px-8 text-lg": size === 'lg',
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
