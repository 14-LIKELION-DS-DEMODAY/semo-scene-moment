import type { CreateSemoRequest, Semo } from '../types/semo'

// TODO: 실제 API 연동 시 교체. 현재는 목데이터로 응답한다.
export async function createSemo(req: CreateSemoRequest): Promise<Semo> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return {
    id: 'mock-semo-1',
    name: req.name,
    nickname: req.nickname,
    coverImageUrl: req.coverImage ? URL.createObjectURL(req.coverImage) : null,
  }
}
