import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-bold tracking-[0.45px] transition-colors disabled:pointer-events-none disabled:bg-surface-soft disabled:text-ash-light [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground active:bg-ps-blue-pressed',
        commerce:
          'bg-commerce text-on-dark active:bg-commerce-pressed',
        destructive:
          'bg-destructive text-white active:bg-destructive/90',
        outline:
          'border border-ash-light bg-transparent text-foreground active:shadow-[0_4px_12px_rgba(0,0,0,0.16)]',
        'outline-dark':
          'border border-hairline-dark bg-transparent text-on-dark active:shadow-[0_4px_12px_rgba(0,0,0,0.16)]',
        secondary:
          'bg-secondary text-secondary-foreground active:bg-secondary/80',
        ghost: 'text-foreground active:bg-surface-soft',
        link: 'text-link-light underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-12 px-7 py-3 text-lg has-[>svg]:px-5',
        sm: 'h-9 px-4 text-sm tracking-[0.32px] has-[>svg]:px-3',
        lg: 'h-12 px-7 py-3 text-lg has-[>svg]:px-5',
        icon: 'size-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
