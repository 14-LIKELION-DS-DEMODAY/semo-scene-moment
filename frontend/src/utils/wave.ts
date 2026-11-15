/**
 * 파형(Wave) 관련 유틸
 */

export type WaveLevel = 1 | 2 | 3 | 4 | 5;

/** 사진 수 → 1~5단계 변환 */
export function getWaveLevel(photoCount: number): WaveLevel {
  if (photoCount <= 2) return 1;
  if (photoCount <= 5) return 2;
  if (photoCount <= 10) return 3;
  if (photoCount <= 20) return 4;
  return 5;
}

/** 단계별 꼭짓점 높이 */
export const WAVE_HEIGHT: Record<WaveLevel, number> = {
  1: 30,
  2: 60,
  3: 90,
  4: 130,
  5: 165,
};

/** "2026-10-11" → "10월 11일" */
export function formatKoreanDate(isoDate: string): string {
  const [, month, day] = isoDate.split('-');
  return `${Number(month)}월 ${Number(day)}일`;
}