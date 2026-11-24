import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { getInviteLink, getParticipants } from '../../api/invite'
import { getSemo } from '../../api/semo'
import Button from '../../components/common/Button'
import Header from '../../components/common/Header'
import Toast from '../../components/common/Toast'
import ParticipantList from '../../components/semo/ParticipantList'
import { useToast } from '../../hooks/useToast'
import MobileLayout from '../../layouts/MobileLayout'
import type { InviteLink } from '../../types/invite'
import type { Participant } from '../../types/participant'
import type { SemoItem } from '../../types/semo'
import { copyText } from '../../utils/clipboard'

export default function InvitePage() {
  const { semoId } = useParams<{ semoId: string }>()
  // undefined: 불러오는 중, null: 없는 세모
  const [semo, setSemo] = useState<SemoItem | null | undefined>(undefined)
  const [link, setLink] = useState<InviteLink | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const toast = useToast()

  useEffect(() => {
    if (!semoId) return
    let active = true
    Promise.all([getSemo(semoId), getInviteLink(semoId), getParticipants(semoId)]).then(
      ([s, l, p]) => {
        if (!active) return
        setSemo(s)
        setLink(l)
        setParticipants(p)
      },
    )
    return () => {
      active = false
    }
  }, [semoId])

  const copyLink = async () => {
    if (!link) return
    toast.show((await copyText(link.url)) ? '초대 링크를 복사했어요.' : '링크를 복사하지 못했어요.')
  }

  const share = async () => {
    if (!link || !semo) return
    if (typeof navigator.share !== 'function') return copyLink()
    try {
      await navigator.share({ title: semo.title, text: `${semo.title}에 함께해요!`, url: link.url })
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return
      await copyLink()
    }
  }

  if (!semoId || semo === null) {
    return (
      <MobileLayout>
        <Header variant="back" title="친구 초대하기" />
        <p className="py-24 text-center text-xs text-gray-400">세모를 찾을 수 없어요.</p>
      </MobileLayout>
    )
  }

  return (
    <MobileLayout>
      <Header variant="back" title="친구 초대하기" />
      <div className="flex flex-1 flex-col px-6 pb-10">
        <h2 className="mt-[60px] text-[26px] font-bold leading-[31px] text-black">{semo?.title}</h2>

        <div className="mt-[30px] flex h-[335px] flex-col items-center rounded-[20px] border border-line bg-white pt-[63px]">
          <p className="text-[14px] font-medium leading-[17px] text-black">
            QR 코드를 스캔해서 참여하기
          </p>
          <div className="mt-3 h-[180px] w-[180px] rounded-lg bg-white p-[13px] [&_path:last-child]:fill-primary-ink">
            {link && <QRCodeSVG value={link.url} size={154} level="M" />}
          </div>
        </div>

        <div className="mt-[30px] flex flex-col gap-[15px]">
          <Button disabled={!link} onClick={copyLink}>
            초대 링크 복사
          </Button>
          <Button variant="secondary" disabled={!link} onClick={share}>
            공유하기
          </Button>
        </div>

        <ParticipantList className="mt-[60px] px-3" participants={participants} />
      </div>
      <Toast message={toast.message} />
    </MobileLayout>
  )
}
