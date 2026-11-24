export interface UploadPhotosResult {
  successCount: number
  failureCount: number
}

export interface SelectedPhoto {
  key: string
  file: File
  previewUrl: string
}

export type AnalysisStatus = 'ANALYZING' | 'DONE' | 'FAILED'
