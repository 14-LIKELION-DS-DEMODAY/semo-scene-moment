import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { assignPhotos, getMatchingResult, getUnclassifiedPhotos } from '../../api/matching'
import Button from '../../components/common/Button'
import Header from '../../components/common/Header'
import Toast from '../../components/common/Toast'
import MomentPicker from '../../components/semo/MomentPicker'
import { useToast } from '../../hooks/useToast'
import MobileLayout from '../../layouts/MobileLayout'
import type { Moment } from '../../types/moment'
import type { UnclassifiedPhoto } from '../../types/matching'
import { matchingPath } from '../../utils/routes'

export default function ManualPage() {
  const { semoId } = useParams<{ semoId: string }>()
  const navigate = useNavigate()
  const [photos, setPhotos] = useState<UnclassifiedPhoto[] | null>(null)
  const [moments, setMoments] = useState<Moment[]>([])
  const [index, setIndex] = useState(0)
  const [choices, setChoices] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const toast = useToast()
  const showToast = toast.show

  useEffect(() => {
    if (!semoId) return
    let active = true
    Promise.all([getUnclassifiedPhotos(semoId), getMatchingResult(semoId)])
      .then(([p, r]) => {
        if (!active) return
        setPhotos(p)
        setMoments(r.moments)
      })
      .catch(() => active && showToast('불러오지 못했어요. 다시 시도해주세요.'))
    return () => {
      active = false
    }
  }, [semoId, showToast])

  if (!semoId) return null
  const resultPath = matchingPath(semoId)

  if (photos && photos.length === 0) return <Navigate to={resultPath} replace />

  const photo = photos?.[index]
  const isLast = photos ? index === photos.length - 1 : false
  const selected = photo ? (choices[photo.id] ?? null) : null

  const choose = (momentId: string | null) => {
    if (!photo) return
    setChoices((prev) => {
      const next = { ...prev }
      if (momentId) next[photo.id] = momentId
      else delete next[photo.id]
      return next
    })
  }

  const back = () => {
    if (index > 0) setIndex(index - 1)
    else navigate(resultPath, { replace: true })
  }

  const next = async () => {
    if (!photos || !selected || submitting) return
    if (!isLast) {
      setIndex(index + 1)
      return
    }
    setSubmitting(true)
    try {
      await assignPhotos(
        semoId,
        photos.map((p) => ({ photoId: p.id, momentId: choices[p.id] })),
      )
      navigate(resultPath, { replace: true })
    } catch {
      toast.show('저장하지 못했어요. 다시 시도해주세요.')
      setSubmitting(false)
    }
  }

  return (
    <MobileLayout>
      <Header variant="back" title="사진 확인" onBack={back} />
      <div className="flex flex-1 flex-col px-6">
        <h2 className="mt-[60px] text-[26px] font-bold leading-[31px] text-black">
          이 사진은 어떤 순간인가요?
        </h2>
        <p className="mt-5 text-[14px] leading-[17px] text-black">Moment를 선택해주세요.</p>

        <div className="mt-[30px] h-[192px] overflow-hidden rounded-[15px] bg-skeleton">
          {photo?.url && <img src={photo.url} alt="" className="h-full w-full object-cover" />}
        </div>

        <p className="mt-[30px] text-[15px] font-semibold leading-[18px] text-black">
          함께 묶을 Moment 선택
        </p>
        <MomentPicker
          className="mt-5 max-h-[234px] overflow-y-auto"
          moments={moments}
          value={selected}
          onChange={choose}
        />

        <div className="mt-auto pb-[50px] pt-8">
          <Button variant="warning" disabled={!selected || submitting} onClick={next}>
            {isLast ? '확인' : '다음'}
          </Button>
        </div>
      </div>
      <Toast message={toast.message} />
    </MobileLayout>
  )
}
