export const semoPath = (semoId: string) => `/semo/${semoId}`
export const uploadPath = (semoId: string) => `/upload/${semoId}`
export const analysisPath = (semoId: string) => `/semo/${semoId}/analysis`

// 업로드 성공 후 이동 경로
export const afterUploadPath = analysisPath
// 분석 완료 후 이동 경로 (매칭 결과 화면이 생기면 교체)
export const afterAnalysisPath = semoPath
// 분석 취소 후 이동 경로
export const afterCancelPath = semoPath
