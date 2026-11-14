import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold tracking-tight transition-all duration-150 ease-out-custom active:scale-[0.98] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer select-none',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--brand-primary)] text-[var(--brand-neutral)] hover:bg-[#0E1E1B] shadow-xs active:bg-[#081210] border border-[var(--brand-primary)]',
        secondary:
          'bg-[var(--brand-secondary)] text-[var(--brand-primary)] hover:bg-[#CCDACC] border border-[#C5D5C4] shadow-xs',
        accent:
          'bg-[var(--brand-accent)] text-[var(--brand-primary)] hover:bg-[#C88E45] font-bold shadow-xs border border-[#C88E45]',
        outline:
          'border border-[var(--border-default)] bg-transparent hover:bg-[var(--brand-secondary)]/30 text-[var(--text-primary)] hover:border-[var(--brand-primary)]',
        ghost:
          'hover:bg-[var(--brand-secondary)]/40 hover:text-[var(--brand-primary)] text-[var(--text-primary)]',
        link:
          'text-[var(--brand-primary)] underline-offset-4 hover:underline active:scale-100',
        destructive:
          'bg-[#8A2525] text-[#F7F6F0] hover:bg-[#721C1C] shadow-xs',
        highContrast:
          'bg-[#FFFF00] text-[#000000] border-2 border-[#000000] font-black hover:bg-[#EEEE00]',
      },
      size: {
        default: 'h-11 px-5 py-2.5 min-w-[44px]', // 44px min touch target WCAG 2.2 AA
        sm: 'h-9 rounded-sm px-3.5 text-xs min-w-[36px]',
        lg: 'h-12 rounded-md px-7 text-sm font-bold min-w-[48px]',
        icon: 'h-11 w-11 min-h-[44px] min-w-[44px] rounded-md',
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
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };

