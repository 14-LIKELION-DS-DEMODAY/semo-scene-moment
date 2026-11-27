import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ApiError, errorMessage } from '../../api/client'
import { cancelUpload, completeUpload, startUpload, uploadPhoto } from '../../api/upload'
import plusImg from '../../assets/icons/photo-plus.svg'
import Button from '../../components/common/Button'
import Header from '../../components/common/Header'
import Toast from '../../components/common/Toast'
import PhotoThumb from '../../components/semo/PhotoThumb'
import { PHOTO_TYPES, usePhotoSelection } from '../../hooks/usePhotoSelection'
import type { AddResult } from '../../hooks/usePhotoSelection'
import { useToast } from '../../hooks/useToast'
import MobileLayout from '../../layouts/MobileLayout'
import { afterUploadPath } from '../../utils/routes'

const MAX_PHOTOS = 30
const NAVIGATE_DELAY_MS = 1500

// 업로드 자체를 더 진행할 수 없는 에러 (남은 사진도 모두 실패함)
const STOP_CODES = ['UPLOAD_NOT_FOUND', 'UPLOAD_NOT_IN_PROGRESS', 'FORBIDDEN', 'UNAUTHORIZED_GUEST']

const shouldStop = (error: unknown) => error instanceof ApiError && STOP_CODES.includes(error.code)

// 취소에 실패해도 사용자가 할 수 있는 일이 없어 무시
const discardUpload = (uploadId: string) => {
  cancelUpload(uploadId).catch(() => {})
}

// 전송이 끝난 업로드와 올리지 못한 장수
interface SentUpload {
  uploadId: string
  failed: number
}

function addMessage(r: AddResult) {
  const parts: string[] = []
  if (r.overflow > 0) parts.push(`최대 ${MAX_PHOTOS}장까지만 담을 수 있어요. ${r.overflow}장은 제외했어요.`)
  if (r.rejected > 0) parts.push(`JPEG, PNG가 아닌 파일 ${r.rejected}개는 제외했어요.`)
  if (r.tooLarge > 0) parts.push(`20MB가 넘는 사진 ${r.tooLarge}장은 제외했어요.`)
  if (r.duplicates > 0) parts.push(`이미 담은 사진 ${r.duplicates}장은 제외했어요.`)
  return parts.join(' ')
}

export default function UploadPage() {
  const { semoId = '' } = useParams<{ semoId: string }>()
  const navigate = useNavigate()
  const { photos, add, remove } = usePhotoSelection(MAX_PHOTOS)
  const [submitting, setSubmitting] = useState(false)
  // 지금까지 전송을 시도한 장수
  const [sentCount, setSentCount] = useState(0)
  // 사진은 다 보냈는데 완료 요청만 실패한 업로드
  const [pending, setPending] = useState<SentUpload | null>(null)
  const pendingRef = useRef<SentUpload | null>(null)
  const runningRef = useRef(false)
  const leftRef = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const toast = useToast(2500)

  useEffect(() => {
    leftRef.current = false
    return () => {
      leftRef.current = true
      clearTimeout(timerRef.current)
      // 전송 중이면 보내던 사진이 끝난 뒤 submit에서 취소 (동시에 보내면 사진이 남을 수 있음)
      if (!runningRef.current && pendingRef.current) discardUpload(pendingRef.current.uploadId)
    }
  }, [])

  const locked = submitting || pending !== null
  const full = photos.length >= MAX_PHOTOS

  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (files.length === 0) return
    const message = addMessage(add(files))
    if (message) toast.show(message)
  }

  const keepPending = (next: SentUpload | null) => {
    pendingRef.current = next
    setPending(next)
  }

  // 사진을 한 장씩 보냄. 도중에 화면을 나가면 취소하고 null
  const sendPhotos = async (files: File[]): Promise<SentUpload | null> => {
    setSentCount(0)
    const started = await startUpload(semoId, files.length)
    const uploadId = String(started.uploadId)
    let failed = 0

    for (const [index, file] of files.entries()) {
      if (leftRef.current) break
      try {
        await uploadPhoto(uploadId, file)
      } catch (error) {
        if (shouldStop(error)) throw error
        failed += 1
      }
      setSentCount(index + 1)
    }

    if (leftRef.current) {
      discardUpload(uploadId)
      return null
    }
    return { uploadId, failed }
  }

  const submit = async () => {
    if (!semoId || photos.length === 0 || runningRef.current) return
    runningRef.current = true
    setSubmitting(true)

    const unlock = () => {
      runningRef.current = false
      setSubmitting(false)
    }

    let sent: SentUpload | null
    try {
      sent = pendingRef.current ?? (await sendPhotos(photos.map((p) => p.file)))
    } catch (error) {
      toast.show(errorMessage(error))
      unlock()
      return
    }
    if (!sent) return

    const { uploadId, failed } = sent
    try {
      await completeUpload(uploadId)
    } catch (error) {
      const noPhoto = error instanceof ApiError && error.code === 'INVALID_INPUT'
      if (noPhoto || leftRef.current) {
        discardUpload(uploadId)
        keepPending(null)
        toast.show('사진을 한 장도 올리지 못했어요. 다시 시도해주세요.')
      } else if (shouldStop(error)) {
        keepPending(null)
        toast.show(errorMessage(error))
      } else {
        keepPending(sent)
        toast.show(`${errorMessage(error)} 버튼을 눌러 다시 시도해주세요.`)
      }
      unlock()
      return
    }

    pendingRef.current = null
    if (leftRef.current) return

    // 이동할 때까지 잠금 유지
    const goAnalysis = () => navigate(afterUploadPath(semoId, uploadId), { replace: true })
    if (failed === 0) return goAnalysis()
    toast.show(`${failed}장은 올리지 못했어요.`)
    timerRef.current = setTimeout(goAnalysis, NAVIGATE_DELAY_MS)
  }

  const buttonLabel = () => {
    if (submitting) {
      return pending === null && sentCount < photos.length
        ? `올리는 중... ${sentCount}/${photos.length}`
        : '분석 요청 중...'
    }
    return pending === null ? '선택한 사진 올리기' : '분석 다시 요청'
  }

  return (
    <MobileLayout>
      <Header variant="back" title="사진 업로드" />
      <div className="flex flex-1 flex-col px-6">
        <h2 className="mt-[60px] text-[26px] font-bold leading-[31px] text-black">
          어떤 순간을 꺼내볼까요?
        </h2>
        <p className="mt-5 text-[14px] leading-[17px] text-black">
          세모에 참여한 사람들에게만 사진이 공개돼요.
        </p>

        <span className="mt-[30px] self-start rounded-xl bg-primary-light px-4 py-[6px] text-[11px] font-medium text-primary-dark">
          {photos.length}장 선택됨
        </span>

        <div className="mt-[30px] max-h-[429px] overflow-y-auto">
          <div className="grid w-[350px] grid-cols-[repeat(4,80px)] gap-[10px]">
            <button
              type="button"
              aria-label="사진 추가"
              disabled={full || locked}
              onClick={() => inputRef.current?.click()}
              className="flex h-20 w-20 items-center justify-center rounded-[10px] border border-line bg-surface disabled:opacity-40"
            >
              <img src={plusImg} alt="" className="h-8 w-8" />
            </button>
            {photos.map((p) => (
              <PhotoThumb
                key={p.key}
                previewUrl={p.previewUrl}
                disabled={locked}
                onRemove={() => remove(p.key)}
              />
            ))}
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={PHOTO_TYPES.join(',')}
          multiple
          hidden
          onChange={onPick}
        />

        <div className="mt-auto pb-[50px] pt-10">
          <Button
            disabled={photos.length === 0 || submitting}
            aria-busy={submitting}
            onClick={submit}
          >
            {buttonLabel()}
          </Button>
        </div>
      </div>
      <Toast message={toast.message} />
    </MobileLayout>
  )
}
