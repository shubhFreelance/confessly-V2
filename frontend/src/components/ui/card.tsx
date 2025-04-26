import React from 'react';
import { cn } from '../../lib/utils';

// Card Container with hover effect, shadow, and background gradient
export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        'rounded-lg border bg-[#E7CCC1] shadow-xl transform transition-transform duration-300 ease-in-out hover:scale-105',
        className
      )}
      {...props}
    />
  );
};

// Card Header with elegant padding and typography
export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        'flex flex-col space-y-1.5 p-6 border-b border-white/20',
        'bg-gradient-to-r from-blue-600 to-purple-500 rounded-t-lg',
        'text-white',
        className
      )}
      {...props}
    />
  );
};

// Card Title with bold and larger text, adding a gradient effect
export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, ...props }) => {
  return (
    <h3
      className={cn(
        'text-3xl font-semibold leading-none tracking-tight text-shadow-lg',
        'text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-red-500',
        className
      )}
      {...props}
    />
  );
};

// Card Description with subtle color tone and smooth font size transition
export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ className, ...props }) => {
  return (
    <p
      className={cn(
        'text-sm text-muted-foreground transition duration-300 ease-in-out opacity-80 hover:opacity-100',
        className
      )}
      {...props}
    />
  );
};

// Card Content with padding and subtle background transition
export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        'p-6 pt-0 bg-white/10 backdrop-blur-sm rounded-lg',
        'hover:bg-white/20 transition duration-200 ease-in-out',
        className
      )}
      {...props}
    />
  );
};

// Card Footer with flex, center alignment, and more padding for spacing
export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        'flex items-center justify-between p-6 pt-0 border-t border-white/20',
        'bg-gradient-to-l from-white-600 via-indigo-500 to-blue-500 text-white',
        className
      )}
      {...props}
    />
  );
};
