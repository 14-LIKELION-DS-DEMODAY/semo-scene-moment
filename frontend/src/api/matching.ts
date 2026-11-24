import type { Moment } from '../types/moment'
import type { MatchingResult, PhotoAssignment, UnclassifiedPhoto } from '../types/matching'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

interface MockState {
  moments: Moment[]
  unclassified: UnclassifiedPhoto[]
  totalPhotos: number
}

// TODO: 실제 API 연동 시 교체. 업로드 장수와 무관한 고정 목데이터이며 세모별로 메모리에 보관한다.
const states = new Map<string, MockState>()

function seed(): MockState {
  const moments: Moment[] = [
    { id: 'r1', date: '2026-10-29', time: '12:00', title: 'Moment 1', photoCount: 12, memberCount: 4 },
    { id: 'r2', date: '2026-10-29', time: '15:30', title: 'Moment 2', photoCount: 8, memberCount: 3 },
    { id: 'r3', date: '2026-10-30', time: '10:00', title: 'Moment 3', photoCount: 15, memberCount: 4 },
    { id: 'r4', date: '2026-10-30', time: '18:20', title: 'Moment 4', photoCount: 6, memberCount: 2 },
  ]
  const unclassified: UnclassifiedPhoto[] = [{ id: 'u1' }, { id: 'u2' }, { id: 'u3' }]
  const totalPhotos = moments.reduce((sum, m) => sum + m.photoCount, 0) + unclassified.length
  return { moments, unclassified, totalPhotos }
}

function stateOf(semoId: string): MockState {
  let state = states.get(semoId)
  if (!state) {
    state = seed()
    states.set(semoId, state)
  }
  return state
}

export async function getMatchingResult(semoId: string): Promise<MatchingResult> {
  await delay(300)
  const { moments, unclassified, totalPhotos } = stateOf(semoId)
  return {
    moments: moments.map((m) => ({ ...m })),
    totalPhotos,
    unclassifiedCount: unclassified.length,
  }
}

export async function getUnclassifiedPhotos(semoId: string): Promise<UnclassifiedPhoto[]> {
  await delay(200)
  return stateOf(semoId).unclassified.map((p) => ({ ...p }))
}

export async function assignPhotos(semoId: string, assignments: PhotoAssignment[]): Promise<void> {
  await delay(400)
  const state = stateOf(semoId)
  for (const { photoId, momentId } of assignments) {
    const moment = state.moments.find((m) => m.id === momentId)
    if (!moment) continue
    moment.photoCount += 1
    state.unclassified = state.unclassified.filter((p) => p.id !== photoId)
  }
}
