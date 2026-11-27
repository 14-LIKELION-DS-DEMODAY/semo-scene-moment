const CODE_PATTERN = /^[A-Z0-9]{6}$/

/** 초대 코드 또는 초대 링크 전체에서 코드(대문자·숫자 6자리)만 뽑는다. 형식이 아니면 null */
export function extractInviteCode(input: string): string | null {
  const value = input.trim()
  const match = value.match(/\/join\/([^/?#\s]+)/)
  const code = (match ? match[1] : value).toUpperCase()
  return CODE_PATTERN.test(code) ? code : null
}
