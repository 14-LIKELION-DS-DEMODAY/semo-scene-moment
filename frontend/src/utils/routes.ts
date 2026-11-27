export const semoPath = (semoId: string) => `/semo/${semoId}`
export const uploadPath = (semoId: string) => `/upload/${semoId}`
export const analysisPath = (semoId: string, uploadId: string) =>
  `/semo/${semoId}/uploads/${uploadId}/analysis`
export const matchingPath = (semoId: string, uploadId?: string) =>
  `/semo/${semoId}/matching${uploadId ? `?uploadId=${uploadId}` : ''}`
export const manualMatchingPath = (semoId: string) => `/semo/${semoId}/matching/manual`
export const momentPath = (semoId: string, momentId: string) => `/semo/${semoId}/moments/${momentId}`
export const photoPath = (semoId: string, momentId: string, photoId: string) =>
  `/semo/${semoId}/moments/${momentId}/photos/${photoId}`

// 업로드 성공 후 이동 경로
export const afterUploadPath = analysisPath
// 분석 완료 후 이동 경로
export const afterAnalysisPath = matchingPath
// 분석 취소 후 이동 경로
export const afterCancelPath = semoPath
