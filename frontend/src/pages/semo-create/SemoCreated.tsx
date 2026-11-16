import { useNavigate } from 'react-router-dom'
import Button from '../../components/common/Button'
import Header from '../../components/common/Header'
import MobileLayout from '../../layouts/MobileLayout'
import type { Semo } from '../../types/semo'

export default function SemoCreated({ semo }: { semo: Semo }) {
  const navigate = useNavigate()
  const goDetail = () => navigate(`/semo-detail/${semo.id}`)
  return (
    <MobileLayout>
      <Header title="세모 만들기" rightLabel="닫기" onRightClick={goDetail} />
      <main className="flex flex-1 flex-col items-center px-6">
        <svg className="mt-[130px]" width="100" height="90" viewBox="0 0 100 90" fill="none">
          <path d="M2 14V2h14M84 2h14v12" stroke="#1f2d3a" strokeWidth="3" />
          <rect x="18" y="14" width="44" height="30" stroke="#1f2d3a" strokeWidth="3" />
          <rect x="18" y="50" width="38" height="30" stroke="#1f2d3a" strokeWidth="3" />
          <rect x="60" y="14" width="30" height="58" fill="#6699bb" />
          <path d="M55 40l5-9 5 9z" fill="#1f2d3a" />
          <circle cx="86" cy="74" r="12" fill="#35698c" />
          <path
            d="M80 74l4 4 7-8"
            stroke="#fff"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <h2 className="mt-[56px] text-[25px] font-extrabold text-ink">세모가 만들어졌어요!</h2>
        <p className="mt-4 text-[15px] text-ink">친구들을 초대해 같은 순간을 모아보세요.</p>
        <div className="mt-auto flex w-full flex-col gap-3 px-3 pb-[46px]">
          <Button onClick={() => navigate(`/invite/${semo.id}`)}>친구 초대하기</Button>
          <Button variant="outline" onClick={goDetail}>
            참여 중인 세모로 이동
          </Button>
        </div>
      </main>
    </MobileLayout>
  )
}
