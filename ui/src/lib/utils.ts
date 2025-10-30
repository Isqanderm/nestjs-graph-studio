import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes with clsx
 * This allows conditional classes and proper Tailwind class merging
 * 
 * @example
 * cn('px-2 py-1', condition && 'bg-red-500', 'text-white')
 * cn('px-2', 'px-4') // Returns 'px-4' (later class wins)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

