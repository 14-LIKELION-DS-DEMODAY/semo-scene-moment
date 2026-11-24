import type { Moment } from '../../types/moment'
import { formatMomentDateTimeShort } from '../../utils/moment'

interface MomentPickerProps {
  moments: Moment[]
  value: string | null
  onChange: (momentId: string | null) => void
  className?: string
}

export default function MomentPicker({ moments, value, onChange, className = '' }: MomentPickerProps) {
  return (
    <ul className={`flex flex-col gap-[5px] ${className}`}>
      {moments.map((m) => {
        const selected = m.id === value
        return (
          <li key={m.id}>
            <button
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(selected ? null : m.id)}
              className={`flex h-[59px] w-full items-center gap-[15px] rounded-[14px] border bg-white py-[7px] pl-[7px] text-left ${
                selected ? 'border-primary-dark' : 'border-line'
              }`}
            >
              {m.thumbnailUrl ? (
                <img src={m.thumbnailUrl} alt="" className="h-[45px] w-[45px] shrink-0 rounded-[10px] object-cover" />
              ) : (
                <div className="h-[45px] w-[45px] shrink-0 rounded-[10px] bg-skeleton" />
              )}
              <div className="flex flex-col gap-[9px]">
                <p className="text-[14px] font-bold leading-[17px] text-black">{m.title}</p>
                <div className="flex gap-4 whitespace-nowrap text-[11px] leading-[13px] text-black">
                  <span>{formatMomentDateTimeShort(m)}</span>
                  <span>{m.photoCount}장</span>
                  <span>{m.memberCount}명</span>
                </div>
              </div>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
