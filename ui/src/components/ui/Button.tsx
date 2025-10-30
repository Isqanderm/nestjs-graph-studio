import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-elevated disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        default:
          'bg-accent text-white shadow-sm hover:bg-accent-hover hover:shadow-md active:scale-95',
        destructive:
          'bg-status-red text-white shadow-sm hover:bg-status-red/90 hover:shadow-md active:scale-95',
        outline:
          'border-2 border-border bg-transparent hover:bg-devtools-hover-bg hover:border-accent/50 hover:text-text-primary active:scale-95',
        secondary:
          'bg-bg-tertiary text-text-primary border border-border shadow-sm hover:bg-bg-elevated hover:border-accent/30 hover:shadow-md active:scale-95',
        ghost:
          'hover:bg-devtools-hover-bg hover:text-text-primary active:bg-devtools-active-bg',
        link:
          'text-accent underline-offset-4 hover:underline hover:text-accent-hover',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-11 rounded-lg px-6 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };

