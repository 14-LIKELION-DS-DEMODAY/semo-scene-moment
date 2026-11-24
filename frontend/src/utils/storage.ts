export const NICKNAME_KEY = 'nickname'

export function readNickname(): string {
  try {
    return localStorage.getItem(NICKNAME_KEY) ?? ''
  } catch {
    return ''
  }
}

export function saveNickname(nickname: string) {
  try {
    localStorage.setItem(NICKNAME_KEY, nickname)
  } catch {
    // localStorage 사용 불가 시 무시
  }
}
