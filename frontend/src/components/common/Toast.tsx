export default function Toast({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <div
      role="status"
      className="fixed bottom-[120px] left-1/2 z-20 -translate-x-1/2 rounded-full bg-primary-dark px-5 py-3 text-[13px] font-medium text-white"
    >
      {message}
    </div>
  )
}
