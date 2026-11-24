export const semoPath = (semoId: string) => `/semo/${semoId}`
export const uploadPath = (semoId: string) => `/upload/${semoId}`
export const analysisPath = (semoId: string) => `/semo/${semoId}/analysis`
export const matchingPath = (semoId: string) => `/semo/${semoId}/matching`
export const manualMatchingPath = (semoId: string) => `/semo/${semoId}/matching/manual`
// Moment 상세 라우트가 생기기 전까지 세모 상세로 보냄. 생기면 `/semo/${semoId}/moments/${momentId}`로 교체
export const momentPath = (semoId: string, _momentId: string) => semoPath(semoId)

// 업로드 성공 후 이동 경로
export const afterUploadPath = analysisPath
// 분석 완료 후 이동 경로
export const afterAnalysisPath = matchingPath
// 분석 취소 후 이동 경로
export const afterCancelPath = semoPath
