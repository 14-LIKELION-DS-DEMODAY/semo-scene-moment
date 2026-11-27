import { useEffect, useMemo, useRef, useState } from 'react'
import { ApiError, errorMessage } from '../../api/client'
import { getMe } from '../../api/home'
import { createSemo } from '../../api/semo'
import Button from '../../components/common/Button'
import Header from '../../components/common/Header'
import Input from '../../components/common/Input'
import Toast from '../../components/common/Toast'
import CharCounter from '../../components/semo/CharCounter'
import PhotoPicker from '../../components/semo/PhotoPicker'
import { useApi } from '../../hooks/useApi'
import { useToast } from '../../hooks/useToast'
import MobileLayout from '../../layouts/MobileLayout'
import { createUuid } from '../../utils/uuid'
import SemoCreated from './SemoCreated'

const NAME_MAX = 30
const NICKNAME_MAX = 10
const COVER_TYPES = ['image/jpeg', 'image/png']
const COVER_MAX_BYTES = 20 * 1024 * 1024

const COVER_TYPE_MESSAGE = '대표 사진은 JPEG, PNG만 사용할 수 있어요.'
const COVER_SIZE_MESSAGE = '대표 사진은 20MB 이하만 사용할 수 있어요.'

function createErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    switch (error.code) {
      case 'INVALID_INPUT':
        // 서버 문구에 어떤 입력이 잘못됐는지 담겨 있음
        return error.message
      case 'UNSUPPORTED_FILE_TYPE':
        return COVER_TYPE_MESSAGE
      case 'FILE_TOO_LARGE':
        return COVER_SIZE_MESSAGE
      case 'NETWORK_ERROR':
        return '서버에 연결할 수 없어요. 네트워크를 확인하고 다시 시도해주세요.'
    }
  }
  return errorMessage(error)
}

export default function SemoCreatePage() {
  const [name, setName] = useState('')
  // null: 아직 직접 입력하지 않음 → 기본 닉네임을 보여줌
  const [typedNickname, setTypedNickname] = useState<string | null>(null)
  const [photo, setPhoto] = useState<File | null>(null)
  const [touched, setTouched] = useState({ name: false, nickname: false })
  const [createdId, setCreatedId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const submittingRef = useRef(false)
  // 화면에 들어올 때 한 번만 만들고, 실패 후 다시 눌러도 같은 값을 보냄
  const [requestId] = useState(createUuid)
  const toast = useToast(2500)
  // 조회에 실패해도 닉네임은 직접 입력할 수 있음
  const { data: me } = useApi('me', getMe)
  const nickname = typedNickname ?? me?.defaultNickname ?? ''

  const preview = useMemo(() => (photo ? URL.createObjectURL(photo) : null), [photo])

  useEffect(() => {
    if (!preview) return
    return () => URL.revokeObjectURL(preview)
  }, [preview])

  if (createdId !== null) return <SemoCreated semoId={createdId} />

  const valid = name.trim() !== '' && nickname.trim() !== ''
  const nameError = touched.name && name.trim() === '' ? '세모 이름을 입력해주세요.' : undefined
  const nicknameError =
    touched.nickname && nickname.trim() === '' ? '사용할 닉네임을 입력해주세요.' : undefined

  const selectPhoto = (file: File) => {
    if (!COVER_TYPES.includes(file.type)) return toast.show(COVER_TYPE_MESSAGE)
    if (file.size > COVER_MAX_BYTES) return toast.show(COVER_SIZE_MESSAGE)
    setPhoto(file)
  }

  const submit = async () => {
    if (!valid || submittingRef.current) return
    submittingRef.current = true
    setSubmitting(true)
    try {
      const { semoId } = await createSemo(
        { name: name.trim(), nickname: nickname.trim(), coverImage: photo },
        requestId,
      )
      setCreatedId(semoId)
    } catch (error) {
      toast.show(createErrorMessage(error))
    } finally {
      submittingRef.current = false
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
            onChange={(e) => setTypedNickname(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, nickname: true }))}
            error={nicknameError}
          />
          {!nicknameError && <CharCounter length={nickname.length} max={NICKNAME_MAX} />}
        </div>
        <div className="mt-[41px]">
          <PhotoPicker label="대표 사진" previewUrl={preview} onChange={selectPhoto} />
        </div>

        <div className="mt-auto pb-[50px] pt-8">
          <Button disabled={!valid || submitting} aria-busy={submitting} onClick={submit}>
            {submitting ? '세모 만드는 중...' : '세모 만들기'}
          </Button>
        </div>
      </div>
      <Toast message={toast.message} />
    </MobileLayout>
  )
}
