import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/common/Button'
import Header from '../../components/common/Header'
import Input from '../../components/common/Input'
import MobileLayout from '../../layouts/MobileLayout'
import { extractInviteCode } from '../../utils/invite'

export default function JoinCodePage() {
  const navigate = useNavigate()
  const [value, setValue] = useState('')
  const code = extractInviteCode(value)

  const next = () => {
    if (code) navigate(`/join/${encodeURIComponent(code)}`)
  }

  return (
    <MobileLayout>
      <Header variant="back" title="참여하기" />
      <div className="flex flex-1 flex-col px-6 pb-[50px] pt-[60px]">
        <Input
          label="초대 코드 또는 링크"
          placeholder="초대 코드나 링크를 붙여넣어 주세요"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && next()}
        />
        <div className="mt-auto pt-8">
          <Button disabled={!code} onClick={next}>
            다음
          </Button>
        </div>
      </div>
    </MobileLayout>
  )
}
