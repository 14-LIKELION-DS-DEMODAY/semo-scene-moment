import { useEffect, useMemo, useState } from 'react'
import { createSemo } from '../../api/semo'
import Button from '../../components/common/Button'
import Header from '../../components/common/Header'
import Input from '../../components/common/Input'
import CharCounter from '../../components/semo/CharCounter'
import PhotoPicker from '../../components/semo/PhotoPicker'
import MobileLayout from '../../layouts/MobileLayout'
import type { SemoItem } from '../../types/semo'
import { readNickname, saveNickname } from '../../utils/storage'
import SemoCreated from './SemoCreated'

const NAME_MAX = 30
const NICKNAME_MAX = 10

export default function SemoCreatePage() {
  const [name, setName] = useState('')
  const [nickname, setNickname] = useState(readNickname)
  const [photo, setPhoto] = useState<File | null>(null)
  const [touched, setTouched] = useState({ name: false, nickname: false })
  const [created, setCreated] = useState<SemoItem | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const preview = useMemo(() => (photo ? URL.createObjectURL(photo) : null), [photo])

  useEffect(() => {
    if (!preview) return
    return () => URL.revokeObjectURL(preview)
  }, [preview])

  if (created) return <SemoCreated semo={created} />

  const valid = name.trim() !== '' && nickname.trim() !== ''
  const nameError = touched.name && name.trim() === '' ? '세모 이름을 입력해주세요.' : undefined
  const nicknameError =
    touched.nickname && nickname.trim() === '' ? '사용할 닉네임을 입력해주세요.' : undefined

  const submit = async () => {
    if (!valid || submitting) return
    setSubmitting(true)
    try {
      const semo = await createSemo({
        name: name.trim(),
        nickname: nickname.trim(),
        coverImage: photo,
      })
      saveNickname(nickname.trim())
      setCreated(semo)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <MobileLayout>
      <Header variant="back" title="세모 만들기" />
      <div className="flex flex-1 flex-col px-6">
        <h2 className="mt-[60px] text-[26px] font-bold leading-[31px] text-black">
          어떤 순간을 함께 모아볼까요?
        </h2>
        <p className="mt-5 text-[14px] leading-[17px] text-black">
          친구들과의 여행, 모임, 평범했던 하루까지.
        </p>

        <div className="mt-[70px]">
          <Input
            label="세모 이름"
            required
            placeholder="예: 우리의 부산 여행"
            maxLength={NAME_MAX}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, name: true }))}
            error={nameError}
          />
          {!nameError && <CharCounter length={name.length} max={NAME_MAX} />}
        </div>
        <div className="mt-[41px]">
          <Input
            label="내 닉네임"
            required
            placeholder="예: 여진"
            maxLength={NICKNAME_MAX}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, nickname: true }))}
            error={nicknameError}
          />
          {!nicknameError && <CharCounter length={nickname.length} max={NICKNAME_MAX} />}
        </div>
        <div className="mt-[41px]">
          <PhotoPicker label="대표 사진" previewUrl={preview} onChange={setPhoto} />
        </div>

        <div className="mt-auto pb-[50px] pt-8">
          <Button disabled={!valid || submitting} onClick={submit}>
            세모 만들기
          </Button>
        </div>
      </div>
    </MobileLayout>
  )
}
