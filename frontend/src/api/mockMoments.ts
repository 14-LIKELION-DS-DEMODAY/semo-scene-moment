import type { Moment } from '../types/moment';

/**
 * 임시 목데이터 (세모 ID → Moment 목록)
 * - 키가 없거나 빈 배열이면 "빈 세모" 화면이 나옵니다. (예: id '2' → 빈 세모)
 * - 백엔드 연동 시 이 파일을 지우고 API 응답으로 교체하세요.
 */
export const MOCK_MOMENTS: Record<string, Moment[]> = {
  '1': [
    { id: 'm1', date: '2026-10-11', time: '10:00', title: 'Moment 1', photoCount: 4, memberCount: 3 },
    { id: 'm2', date: '2026-10-11', time: '14:00', title: 'Moment 2', photoCount: 12, memberCount: 4 },
    { id: 'm3', date: '2026-10-11', time: '17:00', title: 'Moment 3', photoCount: 8, memberCount: 3 },
    { id: 'm4', date: '2026-10-12', time: '09:30', title: 'Moment 1', photoCount: 22, memberCount: 3 },
    { id: 'm5', date: '2026-10-12', time: '15:00', title: 'Moment 2', photoCount: 2, memberCount: 2 },
    { id: 'm6', date: '2026-10-13', time: '11:00', title: 'Moment 1', photoCount: 7, memberCount: 3 },
  ],
};
