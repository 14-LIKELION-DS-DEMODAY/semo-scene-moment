import { useEffect, useMemo, useState } from 'react'

export function useToast(duration = 2000) {
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(null), duration)
    return () => clearTimeout(timer)
  }, [message, duration])

  // setMessage는 참조가 고정이라 show도 고정되고, 객체는 message가 바뀔 때만 새로 만들어짐
  return useMemo(() => ({ message, show: setMessage }), [message])
}
