import type { SemoItem } from '../types/semo';

/**
 * 임시 목데이터 (백엔드 연동 전까지 사용)
 * - 빈 배열 [] 로 바꾸면 홈의 "신규(빈 상태)" 화면을 확인할 수 있어요.
 * - 연동 후에는 이 파일을 지우고 api 호출 결과로 교체하면 됩니다.
 */
export const MOCK_SEMOS: SemoItem[] = [
   {
     id: '1',
     title: '우리의 부산 여행',
     date: '2026.11.02',
     photoCount: 32,
     memberCount: 3,
     role: 'OWNER',
     createdAt: '2026-10-20T10:00:00',
     lastActivityAt: '2026-11-02T12:00:00',
   },
   {
     id: '2',
     title: '친구들과 카페',
     date: '2026.10.29',
     photoCount: 12,
     memberCount: 4,
     role: 'MEMBER',
     createdAt: '2026-10-29T14:00:00',
     lastActivityAt: '2026-10-29T18:00:00',
   },
   {
     id: '3',
     title: '동아리 MT',
     date: '2026.10.15',
     photoCount: 58,
     memberCount: 9,
     role: 'MEMBER',
     createdAt: '2026-10-10T09:00:00',
     lastActivityAt: '2026-10-16T21:00:00',
   },
   {
     id: '4',
     title: '가족 모임',
     date: '2026.09.30',
     photoCount: 21,
     memberCount: 5,
     role: 'OWNER',
     createdAt: '2026-09-28T09:00:00',
     lastActivityAt: '2026-10-01T09:00:00',
   },
];
