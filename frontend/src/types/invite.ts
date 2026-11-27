import type { Participant } from './participant'

interface InvitedSemo {
  semoId: number
  name: string
  participantCount: number
  participants: Participant[]
}

/** 친구 초대하기 화면 (GET /api/semos/{semoId}/invite) */
export interface InviteInfo extends InvitedSemo {
  inviteCode: string
  inviteUrl: string
}

/** 초대받은 세모 정보 (GET /api/invites/{inviteCode}) */
export interface Invitation extends InvitedSemo {
  alreadyJoined: boolean
  /** 기본 닉네임. 없으면 null */
  suggestedNickname: string | null
}

export interface JoinSemoResponse {
  semoId: number
  participantId: number
}
