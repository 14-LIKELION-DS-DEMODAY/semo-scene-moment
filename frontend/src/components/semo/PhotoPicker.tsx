import { useRef } from 'react'

interface PhotoPickerProps {
  label: string
  previewUrl: string | null
  onChange: (file: File) => void
}

export default function PhotoPicker({ label, previewUrl, onChange }: PhotoPickerProps) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <div>
      <p className="mb-3 text-[14px] text-gray-900">{label}</p>
      <button
        type="button"
        aria-label="대표 사진 선택"
        onClick={() => ref.current?.click()}
        className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border border-primary-border bg-primary-disabled/50"
      >
        {previewUrl ? (
          <img src={previewUrl} alt="대표 사진" className="h-full w-full object-cover" />
        ) : (
          <svg width="26" height="26" viewBox="0 0 26 26" stroke="#447F9F" strokeWidth="1.6">
            <path d="M13 1v24M1 13h24" />
          </svg>
        )}
      </button>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onChange(f)
        }}
      />
    </div>
  )
}
