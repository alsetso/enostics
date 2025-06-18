import { forwardRef } from 'react'
import { clsx } from 'clsx'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'border' | 'integrated'
  hover?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hover = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          // Base styles
          "rounded-xl shadow-sm",
          // Variants
          {
            'bg-enostics-gray-950 border border-enostics-gray-800': variant === 'default',
            'backdrop-blur-md bg-white/5 border border-white/10': variant === 'glass',
            'border border-enostics-gray-700 bg-transparent': variant === 'border',
            'bg-transparent border-0 shadow-none': variant === 'integrated',
          },
          // Hover effects
          hover && "transition-all duration-200 hover:border-enostics-gray-700 hover:shadow-lg cursor-pointer",
          className
        )}
        {...props}
      />
    )
  }
)

Card.displayName = "Card"

const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  )
)

CardHeader.displayName = "CardHeader"

const CardTitle = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={clsx("text-lg font-semibold leading-none tracking-tight text-white", className)}
      {...props}
    />
  )
)

CardTitle.displayName = "CardTitle"

const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={clsx("text-sm text-enostics-gray-400", className)}
      {...props}
    />
  )
)

CardDescription.displayName = "CardDescription"

const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx("p-6 pt-0", className)}
      {...props}
    />
  )
)

CardContent.displayName = "CardContent"

const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx("flex items-center p-6 pt-0", className)}
      {...props}
    />
  )
)

CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } 