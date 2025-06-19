import { forwardRef } from 'react'
import { clsx } from 'clsx'
import { cva, type VariantProps } from 'class-variance-authority'

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-enostics-blue text-white hover:bg-enostics-blue/80",
        secondary: "border-transparent bg-[hsl(var(--hover-bg))] text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--hover-bg))]/80",
        destructive: "border-transparent bg-enostics-red text-white hover:bg-enostics-red/80",
        outline: "text-[hsl(var(--text-secondary))] border-[hsl(var(--border-color))]",
        success: "border-transparent bg-enostics-green text-white hover:bg-enostics-green/80",
        warning: "border-transparent bg-enostics-amber text-white hover:bg-enostics-amber/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(badgeVariants({ variant }), className)}
        {...props}
      />
    )
  }
)

Badge.displayName = "Badge"

export { Badge, badgeVariants } 