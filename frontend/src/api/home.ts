import { api } from './client'
import type { SemoItem, SemoRole } from '../types/semo'

/** 서버의 세모 카드 */
interface SemoCardResponse {
  semoId: number
  name: string
  coverImageUrl: string | null
  /** "2026-11-20" */
  date: string
  photoCount: number
  participantCount: number
  role: SemoRole
}

const toSemoItem = (card: SemoCardResponse): SemoItem => ({
  id: String(card.semoId),
  title: card.name,
  date: card.date.replaceAll('-', '.'),
  photoCount: card.photoCount,
  memberCount: card.participantCount,
  role: card.role,
  thumbnailUrl: card.coverImageUrl ?? undefined,
})

export type SemoSort = 'ACTIVITY' | 'CREATED' | 'DATE'

export const getMe = () =>
  api<{ defaultNickname: string | null; hasSemo: boolean }>('/api/guests/me')

export async function getHome() {
  const home = await api<{
    nickname: string | null
    recentSemo: SemoCardResponse | null
    semos: SemoCardResponse[]
  }>('/api/home')

  return {
    nickname: home.nickname,
    recentSemo: home.recentSemo ? toSemoItem(home.recentSemo) : null,
    semos: home.semos.map(toSemoItem),
  }
}

export async function getSemoList(keyword: string, sort: SemoSort) {
  const params = new URLSearchParams({ sort })
  if (keyword) params.set('keyword', keyword)
  const cards = await api<SemoCardResponse[]>(`/api/semos?${params}`)
  return cards.map(toSemoItem)
}
