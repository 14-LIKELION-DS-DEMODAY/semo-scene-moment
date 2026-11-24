import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { cancelAnalysis, getAnalysisStatus } from '../../api/upload'
import ring1 from '../../assets/icons/analysis-ring-1.svg'
import ring2 from '../../assets/icons/analysis-ring-2.svg'
import ring3 from '../../assets/icons/analysis-ring-3.svg'
import logoImg from '../../assets/icons/logo.svg'
import Button from '../../components/common/Button'
import Header from '../../components/common/Header'
import Toast from '../../components/common/Toast'
import { useToast } from '../../hooks/useToast'
import MobileLayout from '../../layouts/MobileLayout'
import type { AnalysisStatus } from '../../types/upload'
import { afterAnalysisPath, afterCancelPath } from '../../utils/routes'

const POLL_INTERVAL_MS = 1500

export default function AnalysisPage() {
  const { semoId } = useParams<{ semoId: string }>()
  const navigate = useNavigate()
  const [failed, setFailed] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const toast = useToast()

  useEffect(() => {
    if (!semoId) return
    let active = true
    let timer: ReturnType<typeof setTimeout> | undefined

    const poll = async () => {
      let status: AnalysisStatus
      try {
        status = await getAnalysisStatus(semoId)
      } catch {
        status = 'FAILED'
      }
      if (!active) return
      if (status === 'DONE') navigate(afterAnalysisPath(semoId), { replace: true })
      else if (status === 'FAILED') setFailed(true)
      else timer = setTimeout(poll, POLL_INTERVAL_MS)
    }
    poll()

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [semoId, navigate])

  const cancel = async () => {
    if (!semoId || cancelling) return
    setCancelling(true)
    try {
      await cancelAnalysis(semoId)
      navigate(afterCancelPath(semoId), { replace: true })
    } catch {
      toast.show('취소하지 못했어요. 다시 시도해주세요.')
      setCancelling(false)
    }
  }

  if (!semoId) return null

  return (
    <MobileLayout>
      <Header variant="back" title="사진 업로드" />
      <div className="flex flex-1 flex-col px-6">
        <h2 className="mt-[60px] text-[26px] font-bold leading-[31px] text-black">
          {failed ? '사진을 분석하지 못했어요.' : '사진을 분석하고 있어요.'}
        </h2>
        <p className="mt-5 text-[14px] leading-[17px] text-black">
          {failed
            ? '잠시 후 다시 시도해주세요.'
            : '사진에 기록된 정보를 바탕으로 같은 순간을 찾고 있어요.'}
        </p>

        {!failed && (
          <div className="relative mx-auto mt-[94px] h-[232px] w-[232px]">
            <img src={ring1} alt="" className="absolute left-0 top-0 h-[232px] w-[232px]" />
            <img src={ring2} alt="" className="absolute left-[19px] top-[19px] h-[194px] w-[194px]" />
            <img src={ring3} alt="" className="absolute left-[37.5px] top-[37.5px] h-[157px] w-[157px]" />
            <img src={logoImg} alt="" className="absolute left-[89px] top-[89px] h-[53px] w-[53px]" />
          </div>
        )}

        <div className="mt-auto pb-[50px] pt-10">
          {failed ? (
            <Button onClick={() => navigate(afterCancelPath(semoId), { replace: true })}>
              돌아가기
            </Button>
          ) : (
            <Button variant="secondary" disabled={cancelling} onClick={cancel}>
              취소하기
            </Button>
          )}
        </div>
      </div>
      <Toast message={toast.message} />
    </MobileLayout>
  )
}
