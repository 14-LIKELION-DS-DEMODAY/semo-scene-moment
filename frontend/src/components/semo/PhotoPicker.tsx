import { useRef } from 'react'
import plusImg from '../../assets/icons/photo-plus.svg'

interface PhotoPickerProps {
  label: string
  previewUrl: string | null
  onChange: (file: File) => void
}

export default function PhotoPicker({ label, previewUrl, onChange }: PhotoPickerProps) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <div>
      <p className="mb-[9px] text-[13px] font-medium leading-4 text-black">{label}</p>
      <button
        type="button"
        aria-label="대표 사진 선택"
        onClick={() => ref.current?.click()}
        className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-[10px] border border-line bg-surface"
      >
        {previewUrl ? (
          <img src={previewUrl} alt="대표 사진" className="h-full w-full object-cover" />
        ) : (
          <img src={plusImg} alt="" className="h-8 w-8" />
        )}
      </button>
      <input
        ref={ref}
        type="file"
        accept="image/jpeg,image/png"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0]
          e.target.value = ''
          if (f) onChange(f)
        }}
      />
    </div>
  )
}
