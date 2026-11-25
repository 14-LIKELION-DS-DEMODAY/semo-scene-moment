import type { Moment } from '../types/moment';
import type { Photo, PhotoComment } from '../types/photo';
import samplePhoto from '../assets/mock/sample-photo.jpg';

/**
 * 임시 목데이터 (Moment → 사진 목록 / 사진 → 댓글)
 * - 백엔드 연동 시 이 파일을 지우고 API 응답으로 교체하세요.
 */
const UPLOADERS = ['여진', '채원', '주현', '정은', '유진'];

/** Moment의 사진 수(photoCount)만큼 사진을 만들어 돌려줍니다. */
export function getMomentPhotos(moment: Moment): Photo[] {
  const start = new Date(`${moment.date}T${moment.time}:00`).getTime();

  return Array.from({ length: moment.photoCount }, (_, i) => ({
    id: `${moment.id}-p${i + 1}`,
    momentId: moment.id,
    uploaderName: UPLOADERS[i % UPLOADERS.length],
    takenAt: new Date(start + i * 60_000).toISOString(),
    likeCount: 14,
    url: samplePhoto,
  }));
}

/** 사진의 기본 댓글 (목데이터) */
export function getPhotoComments(photo: Photo): PhotoComment[] {
  const base = new Date(photo.takenAt);
  const at = (hour: number) => {
    const d = new Date(base);
    d.setHours(hour, 0, 0, 0);
    return d.toISOString();
  };

  return [
    { id: `${photo.id}-c1`, author: '정은', text: '화이팅 화이팅', createdAt: at(12) },
    {
      id: `${photo.id}-c2`,
      author: '채원',
      text: '하다보니까 계속 기능이 추가되고 있어요...',
      createdAt: at(13),
    },
    {
      id: `${photo.id}-c3`,
      author: '여진',
      text: '댓글이 길어지면 이렇게 여러 줄로 줄바꿈되어 보여요. 댓글이 길어지면 이렇게 여러 줄로 줄바꿈되어 보여요.',
      createdAt: at(14),
    },
  ];
}
