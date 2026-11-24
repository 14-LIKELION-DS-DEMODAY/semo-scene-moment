import type { CreateSemoRequest, SemoItem } from '../types/semo';
import { MOCK_SEMOS } from './mockSemos';

// TODO: 실제 API 연동 시 교체. 현재는 목데이터로 응답하고, 상세 화면에서 보이도록 MOCK_SEMOS에 추가한다.
export async function createSemo(req: CreateSemoRequest): Promise<SemoItem> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const now = new Date();
  const semo: SemoItem = {
    id: `mock-${now.getTime()}`,
    title: req.name,
    date: now.toISOString().slice(0, 10).replace(/-/g, '.'),
    photoCount: 0,
    memberCount: 1,
    role: 'OWNER',
    thumbnailUrl: req.coverImage ? URL.createObjectURL(req.coverImage) : undefined,
    createdAt: now.toISOString(),
    lastActivityAt: now.toISOString(),
  };
  MOCK_SEMOS.unshift(semo);
  return semo;
}
