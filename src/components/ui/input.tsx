import { forwardRef } from 'react'
import { clsx } from 'clsx'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label?: string
  description?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, description, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-white"
          >
            {label}
          </label>
        )}
        <input
          type={type}
          id={inputId}
          className={clsx(
            // Base styles
            "flex h-10 w-full rounded-lg border bg-enostics-gray-900 px-3 py-2 text-sm transition-all duration-200",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-white",
            "placeholder:text-enostics-gray-500",
            "focus:outline-none focus:ring-2 focus:ring-enostics-blue/50 focus:border-enostics-blue",
            "disabled:cursor-not-allowed disabled:opacity-50",
            // Error state
            error
              ? "border-enostics-red focus:border-enostics-red focus:ring-enostics-red/50"
              : "border-enostics-gray-700 hover:border-enostics-gray-600",
            className
          )}
          ref={ref}
          {...props}
        />
        {description && (
          <p className="text-xs text-enostics-gray-400">{description}</p>
        )}
        {error && (
          <p className="text-xs text-enostics-red">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"

export { Input } 