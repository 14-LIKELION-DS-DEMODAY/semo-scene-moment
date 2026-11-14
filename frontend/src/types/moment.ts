/**
 * 순간(Moment) 타입
 * 한 세모 안에서 시간대별로 묶인 사진 그룹입니다. (파형의 꼭짓점 1개 = Moment 1개)
 */
export interface Moment {
  id: string;
  /** 날짜 (ISO, 예: "2026-10-11") → 상단 날짜 필터 기준 */
  date: string;
  /** 시작 시간 (예: "14:00") */
  time: string;
  /** 표시 이름 (예: "Moment 2") */
  title: string;
  photoCount: number;
  memberCount: number;
  thumbnailUrl?: string;
}
