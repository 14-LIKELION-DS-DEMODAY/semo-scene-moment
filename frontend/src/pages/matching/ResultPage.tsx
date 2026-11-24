import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getMatchingResult } from '../../api/matching'
import Button from '../../components/common/Button'
import Header from '../../components/common/Header'
import MatchedMomentCard from '../../components/semo/MatchedMomentCard'
import MobileLayout from '../../layouts/MobileLayout'
import type { MatchingResult } from '../../types/matching'
import { manualMatchingPath, momentPath, semoPath } from '../../utils/routes'

export default function ResultPage() {
  const { semoId } = useParams<{ semoId: string }>()
  const navigate = useNavigate()
  // undefined: 불러오는 중, null: 불러오기 실패
  const [result, setResult] = useState<MatchingResult | null | undefined>(undefined)

  useEffect(() => {
    if (!semoId) return
    let active = true
    getMatchingResult(semoId)
      .then((r) => active && setResult(r))
      .catch(() => active && setResult(null))
    return () => {
      active = false
    }
  }, [semoId])

  if (!semoId) return null

  const goSemo = () => navigate(semoPath(semoId), { replace: true })

  return (
    <MobileLayout>
      <Header variant="back" title="매칭 결과" onBack={goSemo} />
      {result === null && (
        <p className="py-24 text-center text-xs text-gray-400">결과를 불러오지 못했어요.</p>
      )}
      {result && (
        <div className="flex flex-1 flex-col px-6">
          <h2 className="mt-[60px] text-[26px] font-bold leading-[31px] text-black">
            새로운 순간 {result.moments.length}개를 발견했어요!
          </h2>
          <p className="mt-5 text-[14px] leading-[17px] text-black">
            전체 사진 {result.totalPhotos}장 분석 완료
          </p>

          <ul className="mt-[30px] flex max-h-[494px] flex-col gap-[10px] overflow-y-auto">
            {result.moments.map((m) => (
              <MatchedMomentCard
                key={m.id}
                moment={m}
                onOpen={() => navigate(momentPath(semoId, m.id))}
              />
            ))}
          </ul>

          <div className="mt-auto pb-[50px] pt-8">
            {result.unclassifiedCount > 0 ? (
              <Button variant="warning" onClick={() => navigate(manualMatchingPath(semoId))}>
                확인이 필요한 사진 {result.unclassifiedCount}장
              </Button>
            ) : (
              <Button onClick={goSemo}>세모 보기</Button>
            )}
          </div>
        </div>
      )}
    </MobileLayout>
  )
}
