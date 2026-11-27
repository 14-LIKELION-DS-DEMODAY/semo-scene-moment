export type UploadStatus = 'UPLOADING' | 'ANALYZING' | 'COMPLETED' | 'FAILED' | 'CANCELED'

export type AnalysisStep = 'EXTRACTING' | 'MATCHING' | 'BUILDING'

export interface UploadStartResponse {
  uploadId: number
}

export interface PhotoUploadResponse {
  photoId: number
  successCount: number
  failCount: number
}

/** 분석 상태 (GET /api/uploads/{uploadId}, 완료·다시 시도·취소의 응답도 같은 형식) */
export interface UploadState {
  uploadId: number
  status: UploadStatus
  step: AnalysisStep | null
  totalCount: number
  successCount: number
  failCount: number
  newMomentCount: number
  addedPhotoCount: number
}

export interface SelectedPhoto {
  key: string
  file: File
  previewUrl: string
}
