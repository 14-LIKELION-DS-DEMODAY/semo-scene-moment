import type { InviteLink, JoinSemoRequest } from '../types/invite'
import type { Participant } from '../types/participant'
import type { SemoItem } from '../types/semo'
import { MOCK_PARTICIPANTS } from './mockParticipants'
import { getSemoByCode } from './semo'

const wait = () => new Promise((resolve) => setTimeout(resolve, 200))

// TODO: 실제 API 연동 시 교체. 현재는 초대 코드 = 세모 id
export async function getInviteLink(semoId: string): Promise<InviteLink> {
  await wait()
  return { code: semoId, url: `${window.location.origin}/join/${encodeURIComponent(semoId)}` }
}

export async function getParticipants(semoId: string): Promise<Participant[]> {
  await wait()
  return MOCK_PARTICIPANTS[semoId] ?? []
}

export async function joinSemo(req: JoinSemoRequest): Promise<SemoItem> {
  await wait()
  const semo = await getSemoByCode(req.code)
  if (!semo) throw new Error('SEMO_NOT_FOUND')
  const list = MOCK_PARTICIPANTS[semo.id] ?? []
  MOCK_PARTICIPANTS[semo.id] = [...list, { id: `p-${Date.now()}`, nickname: req.nickname }]
  semo.memberCount += 1
  return semo
}
