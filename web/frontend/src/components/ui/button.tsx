import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "label-chrome inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xs transition-[filter,transform,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
  {
    variants: {
      variant: {
        default:
          'bevel-chip bg-signal text-white hover:brightness-105 active:bg-nav-gold',
        amber:
          'bevel-chip bg-amber text-carbon hover:brightness-105 active:bg-nav-gold active:text-white',
        carbon:
          'rounded-none bg-carbon text-white hover:brightness-110',
        outline:
          'bevel-chip border border-chrome-indigo bg-sky text-ink hover:bg-periwinkle',
        secondary:
          'bevel-chip border border-chrome-indigo bg-periwinkle text-ink hover:bg-sky',
        ghost: 'hover:bg-sky/60',
        link: 'text-ink-soft underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 min-h-11 px-4 py-2 has-[>svg]:px-3 sm:min-h-9',
        sm: 'h-8 min-h-11 px-3 has-[>svg]:px-2.5 sm:min-h-8',
        lg: 'h-11 min-h-11 px-6 has-[>svg]:px-4',
        icon: 'size-11 sm:size-9',
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
