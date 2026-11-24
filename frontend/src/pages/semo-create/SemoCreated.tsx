import { useNavigate } from 'react-router-dom'
import checkCircleImg from '../../assets/icons/check-circle.svg'
import logoImg from '../../assets/icons/logo.svg'
import Button from '../../components/common/Button'
import Header from '../../components/common/Header'
import MobileLayout from '../../layouts/MobileLayout'
import type { SemoItem } from '../../types/semo'

export default function SemoCreated({ semo }: { semo: SemoItem }) {
  const navigate = useNavigate()
  const goDetail = () => navigate(`/semo/${semo.id}`)
  return (
    <MobileLayout>
      <Header
        variant="back"
        title="세모 만들기"
        rightElement={
          <button type="button" onClick={goDetail} className="text-[12px] font-medium text-primary-dark">
            닫기
          </button>
        }
      />
      <div className="flex flex-1 flex-col items-center px-6">
        <div className="relative mt-[147px] h-[95px] w-[95px]">
          <img src={logoImg} alt="" className="h-[95px] w-[95px]" />
          <img
            src={checkCircleImg}
            alt=""
            className="absolute left-[68px] top-[66px] h-[29px] w-[29px]"
          />
        </div>
        <h2 className="mt-10 text-[26px] font-bold leading-[31px] text-black">세모가 만들어졌어요!</h2>
        <p className="mt-5 text-[14px] leading-[17px] text-black">
          친구들을 초대해 같은 순간을 모아보세요.
        </p>
        <div className="mt-auto flex w-full flex-col gap-[15px] pb-[50px]">
          <Button onClick={() => navigate(`/invite/${semo.id}`)}>친구 초대하기</Button>
          <Button variant="secondary" onClick={goDetail}>
            참여 중인 세모로 이동
          </Button>
        </div>
      </div>
    </MobileLayout>
  )
}
