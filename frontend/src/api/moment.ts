import { api } from './client'
import { formatClock } from '../utils/photo'
import type { Moment } from '../types/moment'

/** 파도 차트용 Moment (waveHeight: 0.2 ~ 1.0) */
export type WaveMoment = Moment & { waveHeight: number }

interface TimelineResponse {
  name: string
  dates: string[]
  selectedDate: string | null
  isEmpty: boolean
  moments: {
    momentId: number
    name: string
    startAt: string
    photoCount: number
    participantCount: number
    waveHeight: number
    representativePhotoUrl: string | null
  }[]
}

export async function getTimeline(semoId: string, date?: string) {
  const query = date ? `?date=${date}` : ''
  const timeline = await api<TimelineResponse>(`/api/semos/${semoId}/timeline${query}`)
  const selectedDate = timeline.selectedDate ?? ''

  return {
    name: timeline.name,
    dates: timeline.dates,
    selectedDate,
    isEmpty: timeline.isEmpty,
    moments: timeline.moments.map(
      (m): WaveMoment => ({
        id: String(m.momentId),
        date: selectedDate,
        time: formatClock(m.startAt),
        title: m.name,
        photoCount: m.photoCount,
        memberCount: m.participantCount,
        thumbnailUrl: m.representativePhotoUrl ?? undefined,
        waveHeight: m.waveHeight,
      }),
    ),
  }
}

export interface MomentDetail {
  momentId: number
  name: string
  startAt: string | null
  endAt: string | null
  representativePhotoUrl: string | null
  photographers: { participantId: number; nickname: string; photoCount: number }[]
  photos: { photoId: number; thumbnailUrl: string; participantId: number }[]
}

export const getMoment = (momentId: string) => api<MomentDetail>(`/api/moments/${momentId}`)

export const renameMoment = (momentId: string, name: string) =>
  api<{ momentId: number; name: string }>(`/api/moments/${momentId}`, {
    method: 'PATCH',
    body: { name },
  })
