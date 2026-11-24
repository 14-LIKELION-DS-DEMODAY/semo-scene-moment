export default function CharCounter({ length, max }: { length: number; max: number }) {
  return (
    <p className="mt-2 h-4 text-right text-[11px] leading-4 text-placeholder">
      {length}/{max}
    </p>
  )
}
