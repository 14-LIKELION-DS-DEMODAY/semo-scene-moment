import { useEffect, useState } from 'react'
import { createSemo } from '../../api/semo'
import Button from '../../components/common/Button'
import Header from '../../components/common/Header'
import Input from '../../components/common/Input'
import PhotoPicker from '../../components/semo/PhotoPicker'
import MobileLayout from '../../layouts/MobileLayout'
import type { Semo } from '../../types/semo'
import SemoCreated from './SemoCreated'

const NICKNAME_KEY = 'semo:nickname'

function readNickname() {
  try {
    return localStorage.getItem(NICKNAME_KEY) ?? ''
  } catch {
    return ''
  }
}

export default function SemoCreatePage() {
  const [name, setName] = useState('')
  const [nickname, setNickname] = useState(readNickname)
  const [photo, setPhoto] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [touched, setTouched] = useState({ name: false, nickname: false })
  const [created, setCreated] = useState<Semo | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!photo) return
    const url = URL.createObjectURL(photo)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [photo])

  if (created) return <SemoCreated semo={created} />

  const valid = name.trim() !== '' && nickname.trim() !== ''

  const submit = async () => {
    if (!valid || submitting) return
    setSubmitting(true)
    try {
      const semo = await createSemo({
        name: name.trim(),
        nickname: nickname.trim(),
        coverImage: photo,
      })
      try {
        localStorage.setItem(NICKNAME_KEY, nickname.trim())
      } catch {
        // localStorage 사용 불가 시 무시
      }
      setCreated(semo)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <MobileLayout>
      <Header title="세모 만들기" />
      <main className="flex flex-1 flex-col px-6">
        <h2 className="mt-[56px] text-[25px] font-extrabold leading-tight text-ink">
          어떤 순간을 함께 모아볼까요?
        </h2>
        <p className="mt-4 text-[15px] text-ink">친구들과의 여행, 모임, 평범했던 하루까지.</p>

        <Input
          className="mt-[72px]"
          label="세모 이름"
          required
          placeholder="예: 우리의 부산 여행"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, name: true }))}
          error={touched.name && name.trim() === '' ? '세모 이름을 입력해주세요.' : undefined}
        />
        <Input
          className="mt-10"
          label="내 닉네임"
          required
          placeholder="예: 여진"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, nickname: true }))}
          error={
            touched.nickname && nickname.trim() === '' ? '사용할 닉네임을 입력해주세요.' : undefined
          }
        />
        <div className="mt-10">
          <PhotoPicker label="대표 사진" previewUrl={preview} onChange={setPhoto} />
        </div>

        <div className="mt-auto px-3 pb-[46px] pt-8">
          <Button disabled={!valid || submitting} onClick={submit}>
            세모 만들기
          </Button>
        </div>
      </main>
    </MobileLayout>
  )
}
