import { useNavigate, useParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { ApiError } from '../../api/client'
import { getInviteInfo } from '../../api/invite'
import Button from '../../components/common/Button'
import Header from '../../components/common/Header'
import StatusView from '../../components/common/StatusView'
import Toast from '../../components/common/Toast'
import ParticipantList from '../../components/semo/ParticipantList'
import { useApi } from '../../hooks/useApi'
import { useToast } from '../../hooks/useToast'
import MobileLayout from '../../layouts/MobileLayout'
import { copyText } from '../../utils/clipboard'

// 다시 시도해도 결과가 같은 에러
const BLOCKED_MESSAGES: Record<string, string> = {
  FORBIDDEN: '이 세모에 참여한 사람만 초대할 수 있어요.',
  SEMO_NOT_FOUND: '세모를 찾을 수 없어요.',
}

export default function InvitePage() {
  const { semoId = '' } = useParams<{ semoId: string }>()
  const navigate = useNavigate()
  const { data: invite, error, reload } = useApi(`invite:${semoId}`, () => getInviteInfo(semoId))
  const toast = useToast()

  if (error || !invite) {
    const blocked = error instanceof ApiError ? BLOCKED_MESSAGES[error.code] : undefined
    return (
      <MobileLayout>
        <Header variant="back" title="친구 초대하기" />
        {blocked ? (
          <div className="flex flex-1 flex-col items-center gap-6 px-6 py-24">
            <p className="text-center text-sm text-gray-900">{blocked}</p>
            <Button variant="secondary" onClick={() => navigate('/home')}>
              홈으로
            </Button>
          </div>
        ) : (
          <StatusView error={error} onRetry={reload} />
        )}
      </MobileLayout>
    )
  }

  const { name, inviteUrl, participants, participantCount } = invite

  const copyLink = async () => {
    toast.show((await copyText(inviteUrl)) ? '초대 링크를 복사했어요.' : '링크를 복사하지 못했어요.')
  }

  const share = async () => {
    if (typeof navigator.share !== 'function') return copyLink()
    try {
      await navigator.share({ title: name, text: `${name}에 함께해요!`, url: inviteUrl })
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return
      await copyLink()
    }
  }

  return (
    <MobileLayout>
      <Header variant="back" title="친구 초대하기" />
      <div className="flex flex-1 flex-col px-6 pb-10">
        <h2 className="mt-[60px] text-[26px] font-bold leading-[31px] text-black">{name}</h2>

        <div className="mt-[30px] flex h-[335px] flex-col items-center rounded-[20px] border border-line bg-white pt-[63px]">
          <p className="text-[14px] font-medium leading-[17px] text-black">
            QR 코드를 스캔해서 참여하기
          </p>
          <div className="mt-3 h-[180px] w-[180px] rounded-lg bg-white p-[13px] [&_path:last-child]:fill-primary-ink">
            <QRCodeSVG value={inviteUrl} size={154} level="M" />
          </div>
        </div>

        <div className="mt-[30px] flex flex-col gap-[15px]">
          <Button onClick={copyLink}>초대 링크 복사</Button>
          <Button variant="secondary" onClick={share}>
            공유하기
          </Button>
        </div>

        <ParticipantList
          className="mt-[60px] px-3"
          participants={participants}
          participantCount={participantCount}
        />
      </div>
      <Toast message={toast.message} />
    </MobileLayout>
  )
}
