import { useEffect, useState } from 'react'

export function useToast(duration = 2000) {
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(null), duration)
    return () => clearTimeout(timer)
  }, [message, duration])

  return { message, show: setMessage }
}
