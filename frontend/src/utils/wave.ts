/**
 * 파형(Wave) 관련 유틸
 */

/** 가장 높은 꼭짓점 높이(px). 서버의 waveHeight(0.2~1.0)를 곱해서 사용 */
export const WAVE_MAX_HEIGHT = 132;

/** "2026-10-11" → "10월 11일" */
export function formatKoreanDate(isoDate: string): string {
  const [, month, day] = isoDate.split('-');
  return `${Number(month)}월 ${Number(day)}일`;
}