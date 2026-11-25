/**
 * 사진 타입
 * Moment 안에 속한 사진 1장입니다.
 */
export interface Photo {
  id: string;
  momentId: string;
  /** 올린 사람 닉네임 (예: "여진") */
  uploaderName: string;
  /** 촬영(업로드) 시각 (ISO) */
  takenAt: string;
  likeCount: number;
  url?: string;
}

/** 사진에 달린 댓글 */
export interface PhotoComment {
  id: string;
  author: string;
  text: string;
  /** 작성 시각 (ISO) */
  createdAt: string;
}
