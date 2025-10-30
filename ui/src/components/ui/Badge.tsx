import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-accent text-white shadow hover:bg-accent-hover',
        secondary:
          'border-transparent bg-bg-tertiary text-text-primary hover:bg-bg-elevated',
        destructive:
          'border-transparent bg-status-red text-white shadow hover:bg-status-red/80',
        outline:
          'text-text-primary border-border',
        success:
          'border-transparent bg-status-green/20 text-status-green border-status-green/30',
        warning:
          'border-transparent bg-status-yellow/20 text-status-yellow border-status-yellow/30',
        info:
          'border-transparent bg-status-blue/20 text-status-blue border-status-blue/30',
        error:
          'border-transparent bg-status-red/20 text-status-red border-status-red/30',
        // HTTP Method badges
        get:
          'border-transparent bg-status-blue/20 text-status-blue border-status-blue/30 font-bold',
        post:
          'border-transparent bg-status-green/20 text-status-green border-status-green/30 font-bold',
        put:
          'border-transparent bg-status-yellow/20 text-status-yellow border-status-yellow/30 font-bold',
        patch:
          'border-transparent bg-status-yellow/20 text-status-yellow border-status-yellow/30 font-bold',
        delete:
          'border-transparent bg-status-red/20 text-status-red border-status-red/30 font-bold',
      },
      size: {
        default: 'px-2 py-0.5 text-xs',
        sm: 'px-1.5 py-0 text-[10px]',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

