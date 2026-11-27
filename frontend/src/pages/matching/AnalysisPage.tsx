import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ApiError, errorMessage } from '../../api/client'
import { cancelUpload, getUpload, retryUpload } from '../../api/upload'
import ring1 from '../../assets/icons/analysis-ring-1.svg'
import ring2 from '../../assets/icons/analysis-ring-2.svg'
import ring3 from '../../assets/icons/analysis-ring-3.svg'
import logoImg from '../../assets/icons/logo.svg'
import Button from '../../components/common/Button'
import Header from '../../components/common/Header'
import Toast from '../../components/common/Toast'
import { useToast } from '../../hooks/useToast'
import MobileLayout from '../../layouts/MobileLayout'
import { afterAnalysisPath, afterCancelPath } from '../../utils/routes'

const POLL_INTERVAL_MS = 1500

type View = 'analyzing' | 'failed' | 'uploading' | 'canceled' | 'missing' | 'forbidden'

const TEXTS: Record<View, { title: string; description: string }> = {
  analyzing: {
    title: '사진을 분석하고 있어요.',
    description: '사진에 기록된 정보를 바탕으로 같은 순간을 찾고 있어요.',
  },
  failed: { title: '사진을 분석하지 못했어요.', description: '다시 시도하거나 업로드를 취소해주세요.' },
  uploading: {
    title: '업로드가 끝나지 않았어요.',
    description: '업로드를 취소하고 사진을 다시 올려주세요.',
  },
  canceled: { title: '취소된 업로드예요.', description: '세모에서 사진을 다시 올릴 수 있어요.' },
  missing: { title: '업로드를 찾을 수 없어요.', description: '세모에서 사진을 다시 올려주세요.' },
  forbidden: { title: '볼 수 없는 업로드예요.', description: '내가 올린 사진만 확인할 수 있어요.' },
}

// 다시 조회해도 결과가 같은 에러
const FINAL_ERRORS: Record<string, View> = {
  UPLOAD_NOT_FOUND: 'missing',
  FORBIDDEN: 'forbidden',
}

const finalView = (error: unknown) =>
  error instanceof ApiError ? FINAL_ERRORS[error.code] : undefined

function Analysis({ semoId, uploadId }: { semoId: string; uploadId: string }) {
  const navigate = useNavigate()
  const [view, setView] = useState<View>('analyzing')
  // 값이 바뀌면 조회를 다시 시작
  const [round, setRound] = useState(0)
  const [unstable, setUnstable] = useState(false)
  const [busy, setBusy] = useState(false)
  const busyRef = useRef(false)
  const mountedRef = useRef(true)
  const toast = useToast()

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    let active = true
    let timer: ReturnType<typeof setTimeout> | undefined

    // 응답을 받은 뒤에 다음 조회를 예약해서 요청이 겹치지 않게 함
    const poll = async () => {
      try {
        const { status } = await getUpload(uploadId)
        if (!active) return
        setUnstable(false)
        if (status === 'COMPLETED') {
          navigate(afterAnalysisPath(semoId, uploadId), { replace: true })
        } else if (status === 'FAILED') setView('failed')
        else if (status === 'CANCELED') setView('canceled')
        else if (status === 'UPLOADING') setView('uploading')
        else {
          setView('analyzing')
          timer = setTimeout(poll, POLL_INTERVAL_MS)
        }
      } catch (error) {
        if (!active) return
        const final = finalView(error)
        if (final) return setView(final)
        // 연결이 잠깐 끊긴 것은 분석 실패가 아니므로 계속 확인
        setUnstable(true)
        timer = setTimeout(poll, POLL_INTERVAL_MS)
      }
    }
    poll()

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [semoId, uploadId, round, navigate])

  const goSemo = () => navigate(afterCancelPath(semoId), { replace: true })

  const restart = () => {
    setView('analyzing')
    setRound((r) => r + 1)
  }

  const run = async (request: () => Promise<unknown>, onSuccess: () => void) => {
    if (busyRef.current) return
    busyRef.current = true
    setBusy(true)
    try {
      await request()
      if (mountedRef.current) onSuccess()
    } catch (error) {
      if (!mountedRef.current) return
      const final = finalView(error)
      if (final) setView(final)
      else {
        toast.show(errorMessage(error))
        // 서버의 상태가 화면과 다름 → 다시 조회해서 맞춤
        const code = error instanceof ApiError ? error.code : ''
        if (code === 'UPLOAD_NOT_FAILED' || code === 'UPLOAD_NOT_IN_PROGRESS') restart()
      }
    } finally {
      busyRef.current = false
      setBusy(false)
    }
  }

  const retry = () => run(() => retryUpload(uploadId), restart)
  const cancel = () => run(() => cancelUpload(uploadId), goSemo)

  const { title, description } = TEXTS[view]

  return (
    <MobileLayout>
      <Header variant="back" title="사진 업로드" />
      <div className="flex flex-1 flex-col px-6">
        <h2 className="mt-[60px] text-[26px] font-bold leading-[31px] text-black">{title}</h2>
        <p className="mt-5 text-[14px] leading-[17px] text-black">{description}</p>

        {view === 'analyzing' && (
          <>
            <div className="relative mx-auto mt-[94px] h-[232px] w-[232px]">
              <img src={ring1} alt="" className="absolute left-0 top-0 h-[232px] w-[232px]" />
              <img src={ring2} alt="" className="absolute left-[19px] top-[19px] h-[194px] w-[194px]" />
              <img src={ring3} alt="" className="absolute left-[37.5px] top-[37.5px] h-[157px] w-[157px]" />
              <img src={logoImg} alt="" className="absolute left-[89px] top-[89px] h-[53px] w-[53px]" />
            </div>
            {unstable && (
              <p role="status" className="mt-6 text-center text-[13px] text-muted">
                상태를 확인하지 못하고 있어요. 다시 확인하는 중...
              </p>
            )}
          </>
        )}

        <div className="mt-auto flex flex-col gap-[15px] pb-[50px] pt-10">
          {view === 'analyzing' && (
            <Button variant="secondary" onClick={goSemo}>
              나가기
            </Button>
          )}
          {view === 'failed' && (
            <Button disabled={busy} onClick={retry}>
              다시 시도
            </Button>
          )}
          {(view === 'failed' || view === 'uploading') && (
            <Button variant="secondary" disabled={busy} onClick={cancel}>
              취소
            </Button>
          )}
          {(view === 'canceled' || view === 'missing' || view === 'forbidden') && (
            <Button onClick={goSemo}>세모 보기</Button>
          )}
        </div>
      </div>
      <Toast message={toast.message} />
    </MobileLayout>
  )
}

export default function AnalysisPage() {
  const { semoId = '', uploadId = '' } = useParams<{ semoId: string; uploadId: string }>()
  // 다른 업로드로 이동하면 상태 초기화
  return <Analysis key={uploadId} semoId={semoId} uploadId={uploadId} />
}
