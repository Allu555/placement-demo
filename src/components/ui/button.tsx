import * as React from "react"
import { cn } from "@/core/utils/cn"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function Button({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer",
        // Variants
        variant === 'default' && "bg-primary text-primary-foreground shadow hover:bg-primary/95",
        variant === 'destructive' && "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        variant === 'outline' && "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        variant === 'secondary' && "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        variant === 'ghost' && "hover:bg-accent hover:text-accent-foreground",
        variant === 'link' && "text-primary underline-offset-4 hover:underline",
        // Sizes
        size === 'default' && "h-9 px-4 py-2",
        size === 'sm' && "h-8 rounded-md px-3 text-xs",
        size === 'lg' && "h-10 rounded-md px-8",
        size === 'icon' && "h-9 w-9",
        className
      )}
      {...props}
    />
  )
}
