import { forwardRef } from 'react'
import { clsx } from 'clsx'
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  // Base styles
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-enostics-blue hover:bg-enostics-blue-dark text-white focus:ring-enostics-blue/50",
        secondary: "bg-white/10 hover:bg-white/20 text-white border border-white/20 focus:ring-white/30",
        ghost: "bg-transparent hover:bg-white/10 text-white/70 hover:text-white focus:ring-white/30",
        destructive: "bg-enostics-red hover:bg-enostics-red/80 text-white focus:ring-enostics-red/50",
        success: "bg-enostics-green hover:bg-enostics-green/80 text-white focus:ring-enostics-green/50",
        outline: "border border-enostics-gray-700 bg-transparent hover:bg-white/5 text-white focus:ring-white/30",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        default: "h-10 px-4 py-2",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={clsx(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants } 