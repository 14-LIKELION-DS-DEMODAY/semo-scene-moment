/**
 * 공통 API 클라이언트
 * - 서버 주소: VITE_API_BASE_URL (없으면 http://localhost:8080)
 * - 게스트 키(X-Guest-Key)는 없으면 자동으로 발급받아 localStorage에 저장
 * - 공통 응답 { success, code, message, data }에서 data만 돌려주고, 실패하면 ApiError를 던짐
 *
 * 사용 예)
 *   const home = await api<HomeResponse>('/api/home')
 *   await api('/api/moments/3', { method: 'PATCH', body: { name: '성산일출봉' } })
 *   await api('/api/uploads/5/photos', { method: 'POST', body: formData }) // FormData는 그대로 전송
 */
const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080').replace(/\/$/, '')
const GUEST_KEY_STORAGE = 'guestKey'

export class ApiError extends Error {
  code: string
  status: number

  constructor(code: string, message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
  }
}

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: object | FormData
}

async function send<T>(path: string, options: ApiOptions, guestKey?: string): Promise<T> {
  const { method = 'GET', body } = options
  const headers: Record<string, string> = {}
  if (guestKey) headers['X-Guest-Key'] = guestKey
  const isForm = body instanceof FormData
  if (body && !isForm) headers['Content-Type'] = 'application/json'

  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: isForm ? body : body && JSON.stringify(body),
    })
  } catch {
    throw new ApiError('NETWORK_ERROR', '서버에 연결할 수 없어요.', 0)
  }

  const json = await response.json().catch(() => null)
  if (!response.ok || !json?.success) {
    throw new ApiError(
      json?.code ?? 'UNKNOWN_ERROR',
      json?.message ?? '요청을 처리하지 못했어요.',
      response.status,
    )
  }
  return json.data as T
}

// 여러 요청이 동시에 시작해도 게스트 키는 한 번만 발급
let issuing: Promise<string> | null = null

function getGuestKey(): Promise<string> {
  const saved = localStorage.getItem(GUEST_KEY_STORAGE)
  if (saved) return Promise.resolve(saved)

  issuing ??= send<{ guestKey: string }>('/api/guests', { method: 'POST' })
    .then(({ guestKey }) => {
      localStorage.setItem(GUEST_KEY_STORAGE, guestKey)
      return guestKey
    })
    .finally(() => {
      issuing = null
    })
  return issuing
}

export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const guestKey = await getGuestKey()
  try {
    return await send<T>(path, options, guestKey)
  } catch (error) {
    // 저장해 둔 키가 서버에 없으면(DB 초기화 등) 새로 발급받아 한 번만 다시 시도
    if (!(error instanceof ApiError) || error.code !== 'UNAUTHORIZED_GUEST') throw error
    if (localStorage.getItem(GUEST_KEY_STORAGE) === guestKey) {
      localStorage.removeItem(GUEST_KEY_STORAGE)
    }
    return send<T>(path, options, await getGuestKey())
  }
}

/** 화면에 보여줄 에러 문구 */
export const errorMessage = (error: unknown) =>
  error instanceof ApiError ? error.message : '요청을 처리하지 못했어요.'
