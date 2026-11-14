import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-150 ease-out-custom active:scale-[0.97] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer select-none',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-white hover:bg-blue-700 shadow-sm hover:shadow active:bg-blue-800',
        destructive:
          'bg-red-600 text-white hover:bg-red-700 shadow-sm active:bg-red-800',
        outline:
          'border border-border bg-card hover:bg-muted text-foreground shadow-xs hover:border-slate-400',
        secondary:
          'bg-muted text-foreground hover:bg-slate-200 border border-border shadow-xs',
        ghost:
          'hover:bg-muted hover:text-foreground text-foreground',
        link:
          'text-primary underline-offset-4 hover:underline active:scale-100',
        highContrast:
          'bg-amber-400 text-black border-2 border-white font-extrabold hover:bg-amber-300',
      },
      size: {
        default: 'h-11 px-5 py-2.5 min-w-[44px]', // 44px min touch target WCAG 2.2 AA
        sm: 'h-9 rounded-md px-3 text-xs min-w-[36px]',
        lg: 'h-13 rounded-lg px-8 text-base font-bold min-w-[48px]',
        icon: 'h-11 w-11 min-h-[44px] min-w-[44px] rounded-lg',
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

