import Link from 'next/link'

interface ButtonProps {
  children: React.ReactNode
  href?: string
  onClick?: () => void
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'outline' | 'white' | 'danger'
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  fullWidth?: boolean
  className?: string
}

export default function Button({
  children,
  href,
  onClick,
  size = 'md',
  variant = 'primary',
  disabled = false,
  type = 'button',
  fullWidth = false,
  className = '',
}: ButtonProps) {
  // Button design with soft shadows and smooth transitions
  const baseStyles = 'touch-target inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-300 focus-ring disabled:opacity-50 disabled:cursor-not-allowed'
  
  const sizeStyles = {
    sm: 'px-5 py-2.5 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }
  
  const variantStyles = {
    primary: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 shadow-button-primary hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0',
    secondary: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-soft hover:shadow-soft-lg hover:-translate-y-0.5 active:translate-y-0',
    outline: 'border-2 border-primary-200 text-primary-600 bg-white hover:bg-primary-50 hover:border-primary-300 shadow-soft hover:shadow-soft-lg hover:-translate-y-0.5 active:translate-y-0',
    white: 'bg-white text-gray-700 hover:bg-gray-50 shadow-soft hover:shadow-soft-lg hover:-translate-y-0.5 active:translate-y-0',
    danger: 'bg-danger-500 text-white hover:bg-danger-600 shadow-[0_4px_14px_0_rgba(239,68,68,0.3)] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0',
  }
  
  const widthStyle = fullWidth ? 'w-full' : ''
  
  const combinedStyles = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyle} ${className}`

  if (href) {
    return (
      <Link href={href} className={combinedStyles}>
        {children}
      </Link>
    )
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combinedStyles}
    >
      {children}
    </button>
  )
}
