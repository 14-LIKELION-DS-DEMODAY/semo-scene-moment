import type { PhotoUploadResponse, UploadStartResponse, UploadState } from '../types/upload'
import { api } from './client'

const uploadApiPath = (uploadId: string) => `/api/uploads/${encodeURIComponent(uploadId)}`

export const startUpload = (semoId: string, totalCount: number) =>
  api<UploadStartResponse>(`/api/semos/${encodeURIComponent(semoId)}/uploads`, {
    method: 'POST',
    body: { totalCount },
  })

/** 촬영 시각·위치를 서버가 읽어야 하므로 원본 File을 그대로 보낸다 (압축·변환 금지) */
export function uploadPhoto(uploadId: string, file: File) {
  const form = new FormData()
  form.append('file', file)
  return api<PhotoUploadResponse>(`${uploadApiPath(uploadId)}/photos`, {
    method: 'POST',
    body: form,
  })
}

export const completeUpload = (uploadId: string) =>
  api<UploadState>(`${uploadApiPath(uploadId)}/complete`, { method: 'POST' })

export const getUpload = (uploadId: string) => api<UploadState>(uploadApiPath(uploadId))

export const retryUpload = (uploadId: string) =>
  api<UploadState>(`${uploadApiPath(uploadId)}/retry`, { method: 'POST' })

export const cancelUpload = (uploadId: string) =>
  api<UploadState>(`${uploadApiPath(uploadId)}/cancel`, { method: 'POST' })
