import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * 조회 API 호출 훅
 * - key가 바뀌면 다시 조회 (이전 요청의 늦은 응답은 무시)
 * - 다시 조회하는 동안에는 이전 data를 그대로 보여줌 (화면 깜빡임 방지)
 */
export function useApi<T>(key: string, fetcher: () => Promise<T>) {
  const [state, setState] = useState<{ key?: string; data?: T; error?: unknown }>({})
  const [version, setVersion] = useState(0)
  const fetcherRef = useRef(fetcher)

  useEffect(() => {
    fetcherRef.current = fetcher
  })

  useEffect(() => {
    let alive = true
    fetcherRef.current().then(
      (data) => alive && setState({ key, data }),
      (error: unknown) => alive && setState({ key, error }),
    )
    return () => {
      alive = false
    }
  }, [key, version])

  const reload = useCallback(() => {
    setState((prev) => ({ ...prev, error: undefined }))
    setVersion((v) => v + 1)
  }, [])

  return {
    data: state.data,
    error: state.key === key ? state.error : undefined,
    reload,
  }
}
