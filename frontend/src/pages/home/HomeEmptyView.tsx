import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import emptyCircleImg from '../../assets/icons/empty-circle.svg';

/**
 * 홈 - 신규 사용자 (참여 중인 세모가 없을 때)
 * - 환영 문구 / 중앙 일러스트 / 안내 문구 / 버튼 2개
 */
export default function HomeEmptyView() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-1 flex-col px-6 pb-[30px] pt-[30px]">
      {/* 상단 환영글 */}
      <div className="flex flex-col gap-[10px]">
        <h2 className="text-[26px] font-bold leading-[1.2] text-black">
          세모에 오신 걸 환영합니다!
        </h2>
        <p className="text-[13px] leading-[1.2] text-[#ACACAC]">함께한 순간들을 다시 만나볼까요?</p>
      </div>

      {/* 중앙 일러스트 + 안내 문구 */}
      <div className="mt-[61px] flex flex-col items-center">
        <img
          src={emptyCircleImg}
          alt=""
          className="h-[232px] w-[232px] object-contain"
        />

        <div className="mt-[40px] flex w-[238px] flex-col items-center gap-[16px] text-center text-black">
          <p className="text-[21px] font-bold leading-[1.2]">아직 참여 중인 세모가 없어요</p>
          <p className="text-[13px] leading-[1.2]">
            새 세모를 만들거나 친구의 초대 코드로
            <br />
            함께 추억을 모아보세요.
          </p>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="mt-auto flex w-full flex-col gap-[15px] pt-[77px]">
        <Button onClick={() => navigate('/semo/create')}>새로운 세모 만들기</Button>
        <Button variant="secondary" onClick={() => navigate('/join')}>
          초대 링크로 참여하기
        </Button>
      </div>
    </div>
  );
}
