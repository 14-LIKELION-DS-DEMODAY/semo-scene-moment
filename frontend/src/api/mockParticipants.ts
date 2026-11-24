import type { Participant } from '../types/participant'

const NAMES = ['정여', '여진', '현', '민수', '서연', '하준', '지우', '도윤', '수아']

const seed = (count: number): Participant[] =>
  NAMES.slice(0, count).map((nickname, i) => ({ id: `p${i}`, nickname }))

/** 세모 id → 참여자 목록. 백엔드 연동 전 임시 데이터 */
export const MOCK_PARTICIPANTS: Record<string, Participant[]> = {
  '1': seed(3),
  '2': seed(4),
  '3': seed(9),
  '4': seed(5),
}
