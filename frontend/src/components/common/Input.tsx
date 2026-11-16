import { useId, type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export default function Input({ label, required, error, className = '', ...rest }: InputProps) {
  const id = useId()
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-3 block text-[14px] text-ink">
        {label}
        {required && ' *'}
      </label>
      <input
        id={id}
        aria-invalid={!!error}
        className={`h-[52px] w-full rounded-2xl border bg-field-bg px-4 text-[15px] text-ink outline-none placeholder:text-placeholder ${
          error ? 'border-primary' : 'border-field-border'
        }`}
        {...rest}
      />
      {error && <p className="mt-2 text-[14px] text-primary">{error}</p>}
    </div>
  )
}
