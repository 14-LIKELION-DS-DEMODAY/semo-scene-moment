/**
 * 세모(앨범) 공통 타입
 * 백엔드 API 스펙이 확정되면 필드명만 맞춰서 수정하세요.
 */
export type SemoRole = 'OWNER' | 'MEMBER'; // 방장 | 참여자

export interface SemoItem {
  id: string;
  title: string;
  /** 화면 표시용 날짜 (예: "2026.10.29") */
  date: string;
  photoCount: number;
  memberCount: number;
  role: SemoRole;
  thumbnailUrl?: string;
  /** 정렬용: 생성 시각 (ISO 문자열) */
  createdAt: string;
  /** 정렬용: 마지막 활동 시각 (ISO 문자열) */
  lastActivityAt: string;
}
