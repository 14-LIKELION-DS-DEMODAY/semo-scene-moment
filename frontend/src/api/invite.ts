import type { Invitation, InviteInfo, JoinSemoResponse } from '../types/invite'
import { api } from './client'

const invitationPath = (code: string) => `/api/invites/${encodeURIComponent(code)}`

export const getInviteInfo = (semoId: string) =>
  api<InviteInfo>(`/api/semos/${encodeURIComponent(semoId)}/invite`)

export const getInvitation = (code: string) => api<Invitation>(invitationPath(code))

export const joinSemo = (code: string, nickname: string) =>
  api<JoinSemoResponse>(`${invitationPath(code)}/participants`, {
    method: 'POST',
    body: { nickname },
  })
