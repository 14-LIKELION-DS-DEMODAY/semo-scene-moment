import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { uploadPhotos } from '../../api/upload'
import plusImg from '../../assets/icons/photo-plus.svg'
import Button from '../../components/common/Button'
import Header from '../../components/common/Header'
import Toast from '../../components/common/Toast'
import PhotoThumb from '../../components/semo/PhotoThumb'
import { isHeic, usePhotoSelection } from '../../hooks/usePhotoSelection'
import type { AddResult } from '../../hooks/usePhotoSelection'
import { useToast } from '../../hooks/useToast'
import MobileLayout from '../../layouts/MobileLayout'
import { afterUploadPath } from '../../utils/routes'

const MAX_PHOTOS = 30
const NAVIGATE_DELAY_MS = 1200

function addMessage(r: AddResult) {
  const parts: string[] = []
  if (r.overflow > 0) parts.push(`최대 ${MAX_PHOTOS}장까지만 담을 수 있어요. ${r.overflow}장은 제외했어요.`)
  if (r.rejected > 0) parts.push(`사진이 아닌 파일 ${r.rejected}개는 제외했어요.`)
  if (r.duplicates > 0) parts.push(`이미 담은 사진 ${r.duplicates}장은 제외했어요.`)
  return parts.join(' ')
}

export default function UploadPage() {
  const { semoId } = useParams<{ semoId: string }>()
  const navigate = useNavigate()
  const { photos, add, remove } = usePhotoSelection(MAX_PHOTOS)
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const toast = useToast(2500)

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const full = photos.length >= MAX_PHOTOS

  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (files.length === 0) return
    const message = addMessage(add(files))
    if (message) toast.show(message)
  }

  const submit = async () => {
    if (!semoId || photos.length === 0 || submitting) return
    setSubmitting(true)
    try {
      const { successCount, failureCount } = await uploadPhotos(
        semoId,
        photos.map((p) => p.file),
      )
      if (successCount === 0) {
        toast.show('사진을 올리지 못했어요. 다시 시도해주세요.')
        setSubmitting(false)
        return
      }
      toast.show(
        failureCount > 0
          ? `${successCount}장 올렸고, ${failureCount}장은 올리지 못했어요.`
          : `${successCount}장을 올렸어요.`,
      )
      timerRef.current = setTimeout(() => navigate(afterUploadPath(semoId)), NAVIGATE_DELAY_MS)
    } catch {
      toast.show('사진을 올리지 못했어요. 다시 시도해주세요.')
      setSubmitting(false)
    }
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
              disabled={full || submitting}
              onClick={() => inputRef.current?.click()}
              className="flex h-20 w-20 items-center justify-center rounded-[10px] border border-line bg-surface disabled:opacity-40"
            >
              <img src={plusImg} alt="" className="h-8 w-8" />
            </button>
            {photos.map((p) => (
              <PhotoThumb
                key={p.key}
                previewUrl={p.previewUrl}
                isHeic={isHeic(p.file)}
                disabled={submitting}
                onRemove={() => remove(p.key)}
              />
            ))}
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.heic,.heif"
          multiple
          hidden
          onChange={onPick}
        />

        <div className="mt-auto pb-[50px] pt-10">
          <Button disabled={photos.length === 0 || submitting} onClick={submit}>
            선택한 사진 올리기
          </Button>
        </div>
      </div>
      <Toast message={toast.message} />
    </MobileLayout>
  )
}
