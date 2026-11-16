import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline'
}

export default function Button({
  variant = 'primary',
  className = '',
  type = 'button',
  ...rest
}: ButtonProps) {
  const style =
    variant === 'primary'
      ? 'bg-primary text-white disabled:bg-primary-light'
      : 'bg-white text-primary border border-primary-border'
  return (
    <button
      type={type}
      className={`h-[55px] w-full rounded-[20px] text-[16px] font-bold ${style} ${className}`}
      {...rest}
    />
  )
}
