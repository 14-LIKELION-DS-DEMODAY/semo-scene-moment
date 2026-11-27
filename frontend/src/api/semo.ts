import type { CreateSemoRequest } from '../types/semo';
import { api } from './client';

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
