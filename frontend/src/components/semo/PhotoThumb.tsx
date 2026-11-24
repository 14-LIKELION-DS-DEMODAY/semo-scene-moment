import { useState } from 'react'
import closeImg from '../../assets/icons/temp-icon-close.svg'

interface PhotoThumbProps {
  previewUrl: string
  isHeic: boolean
  disabled?: boolean
  onRemove: () => void
}

export default function PhotoThumb({ previewUrl, isHeic, disabled, onRemove }: PhotoThumbProps) {
  const [failed, setFailed] = useState(false)
  return (
    <div className="relative h-20 w-20">
      <div className="h-full w-full overflow-hidden rounded-[10px] border border-line bg-surface">
        {failed ? (
          <div className="flex h-full w-full items-center justify-center bg-line text-[11px] font-medium text-placeholder">
            {isHeic ? 'HEIC' : '미리보기 없음'}
          </div>
        ) : (
          <img
            src={previewUrl}
            alt=""
            className="h-full w-full object-cover"
            onError={() => setFailed(true)}
          />
        )}
      </div>
      <button
        type="button"
        aria-label="사진 빼기"
        disabled={disabled}
        onClick={onRemove}
        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 disabled:opacity-40"
      >
        <img src={closeImg} alt="" className="h-[10px] w-[10px]" />
      </button>
    </div>
  )
}
