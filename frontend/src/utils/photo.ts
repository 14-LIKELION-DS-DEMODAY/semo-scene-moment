const pad = (n: number) => String(n).padStart(2, '0');

/** ISO → "14:00" */
export function formatClock(iso: string): string {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** ISO → "2026.10.11 14:00" */
export function formatPhotoDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${formatClock(iso)}`;
}

/** ISO → "오후 1:00" (댓글 시간) */
export function formatCommentTime(iso: string): string {
  const d = new Date(iso);
  const hours = d.getHours();
  const period = hours < 12 ? '오전' : '오후';
  return `${period} ${hours % 12 || 12}:${pad(d.getMinutes())}`;
}
