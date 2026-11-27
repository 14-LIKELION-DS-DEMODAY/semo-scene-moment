import { api } from './client'
import type { PhotoComment } from '../types/photo'

interface CommentResponse {
  commentId: number
  nickname: string
  content: string
  createdAt: string
}

interface PhotoResponse {
  photoId: number
  momentId: number
  imageUrl: string
  downloadUrl: string
  takenAt: string | null
  uploader: { participantId: number; nickname: string }
  isMine: boolean
  likeCount: number
  liked: boolean
  commentCount: number
  /** 최신 2개 (시간순) */
  recentComments: CommentResponse[]
  prevPhotoId: number | null
  nextPhotoId: number | null
}

const toComment = (c: CommentResponse): PhotoComment => ({
  id: String(c.commentId),
  author: c.nickname,
  text: c.content,
  createdAt: c.createdAt,
})

export type PhotoDetail = Awaited<ReturnType<typeof getPhoto>>

/** participantId: 촬영자 필터로 들어왔을 때 이전/다음이 그 사람 사진 안에서 돌도록 */
export async function getPhoto(photoId: string, participantId?: string) {
  const query = participantId ? `?participantId=${participantId}` : ''
  const photo = await api<PhotoResponse>(`/api/photos/${photoId}${query}`)
  return { ...photo, recentComments: photo.recentComments.map(toComment) }
}

export const deletePhoto = (photoId: string) =>
  api<{ momentDeleted: boolean }>(`/api/photos/${photoId}`, { method: 'DELETE' })

export const setPhotoLike = (photoId: string, liked: boolean) =>
  api<{ liked: boolean; likeCount: number }>(`/api/photos/${photoId}/likes`, {
    method: liked ? 'POST' : 'DELETE',
  })

export async function getComments(photoId: string) {
  const comments = await api<CommentResponse[]>(`/api/photos/${photoId}/comments`)
  return comments.map(toComment)
}

export const addComment = (photoId: string, content: string) =>
  api<CommentResponse>(`/api/photos/${photoId}/comments`, { method: 'POST', body: { content } })
