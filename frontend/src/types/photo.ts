/** 사진에 달린 댓글 */
export interface PhotoComment {
  id: string;
  author: string;
  text: string;
  /** 작성 시각 (ISO) */
  createdAt: string;
}
