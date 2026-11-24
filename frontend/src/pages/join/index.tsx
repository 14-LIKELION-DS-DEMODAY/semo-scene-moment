import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getParticipants, joinSemo } from '../../api/invite'
import { getSemoByCode } from '../../api/semo'
import logoImg from '../../assets/icons/logo.svg'
import Button from '../../components/common/Button'
import Header from '../../components/common/Header'
import Input from '../../components/common/Input'
import Toast from '../../components/common/Toast'
import CharCounter from '../../components/semo/CharCounter'
import ParticipantList from '../../components/semo/ParticipantList'
import { useToast } from '../../hooks/useToast'
import MobileLayout from '../../layouts/MobileLayout'
import type { Participant } from '../../types/participant'
import type { SemoItem } from '../../types/semo'
import { readNickname, saveNickname } from '../../utils/storage'

const NICKNAME_MAX = 10

export default function JoinPage() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  // undefined: 불러오는 중, null: 없는 초대 코드
  const [semo, setSemo] = useState<SemoItem | null | undefined>(undefined)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [nickname, setNickname] = useState(readNickname)
  const [submitting, setSubmitting] = useState(false)
  const toast = useToast()

  useEffect(() => {
    if (!code) return
    let active = true
    getSemoByCode(code).then(async (found) => {
      const list = found ? await getParticipants(found.id) : []
      if (!active) return
      setSemo(found)
      setParticipants(list)
    })
    return () => {
      active = false
    }
  }, [code])

  const valid = nickname.trim() !== ''

  const submit = async () => {
    if (!code || !valid || submitting) return
    setSubmitting(true)
    try {
      const joined = await joinSemo({ code, nickname: nickname.trim() })
      saveNickname(nickname.trim())
      navigate(`/semo/${joined.id}`)
    } catch {
      toast.show('참여하지 못했어요. 다시 시도해주세요.')
      setSubmitting(false)
    }
  }

  if (!code || semo === null) {
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

  return (
    <MobileLayout>
      <Header variant="back" title="참여하기" />
      <div className="flex flex-1 flex-col px-6 pb-[50px]">
        <div className="mt-9 flex h-[335px] flex-col items-center rounded-[20px] bg-primary-disabled px-4 pt-[68px]">
          <img src={logoImg} alt="" className="h-[100px] w-[100px]" />
          <h2 className="mt-[30px] line-clamp-2 max-w-full break-words text-center text-[26px] font-bold leading-[31px] text-black">
            {semo?.title}
          </h2>
          {semo && (
            <p className="mt-[13px] text-[14px] leading-[17px] text-primary-text">
              {participants.length}명이 기다리고 있어요.
            </p>
          )}
        </div>

        <div className="mt-10">
          <Input
            label="내 닉네임"
            placeholder="예: 여진"
            maxLength={NICKNAME_MAX}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
          <CharCounter length={nickname.length} max={NICKNAME_MAX} />
        </div>

        <ParticipantList className="mt-[21px] pr-6" labelWeight="medium" participants={participants} />

        <div className="mt-auto pt-8">
          <Button disabled={!valid || !semo || submitting} onClick={submit}>
            참여하기
          </Button>
        </div>
      </div>
      <Toast message={toast.message} />
    </MobileLayout>
  )
}
