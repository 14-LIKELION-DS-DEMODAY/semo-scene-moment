import type { AnalysisStatus, UploadPhotosResult } from '../types/upload'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const ANALYSIS_DURATION_MS = 4000
const analysisStartedAt = new Map<string, number>()

// TODO: 실제 API 연동 시 교체. files는 원본 File 그대로 FormData에 담는다(EXIF 보존을 위해 가공 금지).
export async function uploadPhotos(semoId: string, files: File[]): Promise<UploadPhotosResult> {
  const form = new FormData()
  files.forEach((file) => form.append('photos', file))
  void form
  await delay(1000)
  analysisStartedAt.set(semoId, Date.now())
  return { successCount: files.length, failureCount: 0 }
}

// TODO: 실제 API 연동 시 교체. 목데이터는 시작 후 몇 초 뒤 완료로 응답한다.
export async function getAnalysisStatus(semoId: string): Promise<AnalysisStatus> {
  await delay(200)
  const startedAt = analysisStartedAt.get(semoId)
  if (startedAt === undefined) {
    analysisStartedAt.set(semoId, Date.now())
    return 'ANALYZING'
  }
  return Date.now() - startedAt >= ANALYSIS_DURATION_MS ? 'DONE' : 'ANALYZING'
}

export async function cancelAnalysis(semoId: string): Promise<void> {
  await delay(200)
  analysisStartedAt.delete(semoId)
}
