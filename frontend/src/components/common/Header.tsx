import { useNavigate } from 'react-router-dom'

interface HeaderProps {
  title: string
  onBack?: () => void
  rightLabel?: string
  onRightClick?: () => void
}

export default function Header({ title, onBack, rightLabel, onRightClick }: HeaderProps) {
  const navigate = useNavigate()
  return (
    <header className="flex h-[88px] items-end px-6 pb-3">
      <button type="button" aria-label="뒤로가기" onClick={onBack ?? (() => navigate(-1))}>
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          stroke="#000"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 1 3 7l6 6" />
        </svg>
      </button>
      <h1 className="ml-6 text-[17px] font-bold text-ink">{title}</h1>
      {rightLabel && (
        <button type="button" onClick={onRightClick} className="ml-auto text-[13px] text-primary">
          {rightLabel}
        </button>
      )}
    </header>
  )
}
