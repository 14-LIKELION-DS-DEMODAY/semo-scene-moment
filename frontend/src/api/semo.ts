import type { CreateSemoRequest, SemoItem } from '../types/semo';
import { api } from './client';
import { MOCK_SEMOS } from './mockSemos';

export interface CreateSemoResponse {
  semoId: number;
  name: string;
  inviteCode: string;
  inviteUrl: string;
}

/** requestId가 같으면 서버는 새로 만들지 않고 처음 결과를 돌려줌 */
export function createSemo(req: CreateSemoRequest, requestId: string) {
  const form = new FormData();
  form.append('name', req.name);
  form.append('nickname', req.nickname);
  form.append('requestId', requestId);
  if (req.coverImage) form.append('coverImage', req.coverImage);
  return api<CreateSemoResponse>('/api/semos', { method: 'POST', body: form });
}

export async function getSemo(semoId: string): Promise<SemoItem | null> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return MOCK_SEMOS.find((s) => s.id === semoId) ?? null;
}

// 임시: 초대 코드 = 세모 id (getInviteLink와 같이 교체)
export async function getSemoByCode(code: string): Promise<SemoItem | null> {
  return getSemo(code);
}
