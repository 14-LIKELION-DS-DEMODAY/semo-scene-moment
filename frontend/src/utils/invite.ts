/** 초대 코드 또는 초대 링크 전체에서 코드만 뽑는다. 비어 있으면 null */
export function extractInviteCode(input: string): string | null {
  const value = input.trim()
  if (!value) return null
  const match = value.match(/\/join\/([^/?#\s]+)/)
  if (match) {
    try {
      return decodeURIComponent(match[1])
    } catch {
      return match[1]
    }
  }
  return value
}
