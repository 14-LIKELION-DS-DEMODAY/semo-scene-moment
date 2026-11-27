import { useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { ApiError, errorMessage } from '../../api/client'
import { getInvitation, joinSemo } from '../../api/invite'
import logoImg from '../../assets/icons/logo.svg'
import Button from '../../components/common/Button'
import Header from '../../components/common/Header'
import Input from '../../components/common/Input'
import StatusView from '../../components/common/StatusView'
import Toast from '../../components/common/Toast'
import CharCounter from '../../components/semo/CharCounter'
import ParticipantList from '../../components/semo/ParticipantList'
import { useApi } from '../../hooks/useApi'
import { useToast } from '../../hooks/useToast'
import MobileLayout from '../../layouts/MobileLayout'
import { semoPath } from '../../utils/routes'

const NICKNAME_MAX = 10

const hasCode = (error: unknown, code: string) => error instanceof ApiError && error.code === code

function JoinView({ code }: { code: string }) {
  const navigate = useNavigate()
  const { data: invitation, error, reload } = useApi(`invitation:${code}`, () => getInvitation(code))
  // null: 아직 직접 입력하지 않음 → 추천 닉네임을 보여줌
  const [typedNickname, setTypedNickname] = useState<string | null>(null)
  const [nicknameError, setNicknameError] = useState<string>()
  const [inviteMissing, setInviteMissing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const submittingRef = useRef(false)
  const toast = useToast()

  if (inviteMissing || hasCode(error, 'INVITE_NOT_FOUND')) {
    return (
      <MobileLayout>
        <Header variant="back" title="참여하기" />
        <div className="flex flex-1 flex-col items-center gap-6 px-6 py-24">
          <p className="text-center text-sm text-gray-900">초대 링크를 확인해주세요.</p>
          <Button variant="secondary" onClick={() => navigate('/home')}>
            홈으로
          </Button>
        </div>
      </MobileLayout>
    )
  }

  if (error || !invitation) {
    return (
      <MobileLayout>
        <Header variant="back" title="참여하기" />
        <StatusView error={error} onRetry={reload} />
      </MobileLayout>
    )
  }

  const detailPath = semoPath(String(invitation.semoId))
  if (invitation.alreadyJoined) return <Navigate to={detailPath} replace />

  const nickname = typedNickname ?? invitation.suggestedNickname ?? ''
  const valid = nickname.trim() !== ''

  const submit = async () => {
    if (!valid || submittingRef.current) return
    submittingRef.current = true
    setSubmitting(true)
    setNicknameError(undefined)
    try {
      const { semoId } = await joinSemo(code, nickname.trim())
      navigate(semoPath(String(semoId)), { replace: true })
      return
    } catch (e) {
      if (hasCode(e, 'ALREADY_JOINED')) {
        navigate(detailPath, { replace: true })
        return
      }
      if (hasCode(e, 'INVITE_NOT_FOUND')) setInviteMissing(true)
      else if (hasCode(e, 'DUPLICATE_NICKNAME')) setNicknameError(errorMessage(e))
      else toast.show(errorMessage(e))
    }
    submittingRef.current = false
    setSubmitting(false)
  }

  return (
    <MobileLayout>
      <Header variant="back" title="참여하기" />
      <div className="flex flex-1 flex-col px-6 pb-[50px]">
        <div className="mt-9 flex h-[335px] flex-col items-center rounded-[20px] bg-primary-disabled px-4 pt-[68px]">
          <img src={logoImg} alt="" className="h-[100px] w-[100px]" />
          <h2 className="mt-[30px] line-clamp-2 max-w-full break-words text-center text-[26px] font-bold leading-[31px] text-black">
            {invitation.name}
          </h2>
          <p className="mt-[13px] text-[14px] leading-[17px] text-primary-text">
            {invitation.participantCount}명이 기다리고 있어요.
          </p>
        </div>

        <div className="mt-10">
          <Input
            label="내 닉네임"
            placeholder="예: 여진"
            maxLength={NICKNAME_MAX}
            value={nickname}
            onChange={(e) => {
              setTypedNickname(e.target.value)
              setNicknameError(undefined)
            }}
            error={nicknameError}
          />
          {!nicknameError && <CharCounter length={nickname.length} max={NICKNAME_MAX} />}
        </div>

        <ParticipantList
          className="mt-[21px] pr-6"
          labelWeight="medium"
          participants={invitation.participants}
          participantCount={invitation.participantCount}
        />

        <div className="mt-auto pt-8">
          <Button disabled={!valid || submitting} aria-busy={submitting} onClick={submit}>
            {submitting ? '참여하는 중...' : '참여하기'}
          </Button>
        </div>
      </div>
      <Toast message={toast.message} />
    </MobileLayout>
  )
}

export default function JoinPage() {
  const { code = '' } = useParams<{ code: string }>()
  // 다른 초대 코드로 이동하면 입력과 에러 상태 초기화
  return <JoinView key={code} code={code} />
}
