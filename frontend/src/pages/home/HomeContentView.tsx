import { useNavigate } from 'react-router-dom';
import SemoCard from '../../components/semo/SemoCard';
import type { SemoItem } from '../../types/semo';
import plusIcon from '../../assets/icons/icon-plus.svg';
import linkIcon from '../../assets/icons/icon-link.svg';
import chevronRightIcon from '../../assets/icons/icon-chevron-right.svg';

/**
 * 홈 - 기존 사용자 (참여 중인 세모가 1개 이상)
 * - 인사말 / 액션 카드 2개 / 참여 중인 세모(최대 2개) / 이어서 보기(최근 1개)
 */
interface HomeContentViewProps {
  /** 기본 닉네임 (아직 없으면 null) */
  nickname: string | null;
  semoList: SemoItem[];
  /** 이어서 보기 */
  recentSemo: SemoItem | null;
}

/** 섹션 제목(18px) + "전체보기 >" 링크(#447F9F, 12px) */
function SectionHeader({ title, onMore }: { title: string; onMore: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-[18px] font-bold leading-[1.2] text-black">{title}</h3>
      <button
        type="button"
        onClick={onMore}
        className="flex items-center gap-1 text-[12px] font-medium text-[#447F9F]"
      >
        전체보기
        <img src={chevronRightIcon} alt="" className="h-3 w-3" />
      </button>
    </div>
  );
}

export default function HomeContentView({ nickname, semoList, recentSemo }: HomeContentViewProps) {
  const navigate = useNavigate();

  // 참여 중인 세모: 최대 2개만 노출
  const joinedList = semoList.slice(0, 2);

  return (
    <div className="flex flex-col gap-[30px] px-6 pb-6 pt-[30px]">
      {/* 인사말 + 액션 카드 2개 */}
      <div className="flex flex-col gap-[30px]">
        <div className="flex flex-col gap-[10px]">
          <h2 className="text-[26px] font-bold leading-[1.2] text-black">
            {nickname ? `${nickname}님, 반갑습니다!` : '반갑습니다!'}
          </h2>
          <p className="text-[13px] leading-[1.2] text-[#ACACAC]">함께한 순간들을 다시 만나볼까요?</p>
        </div>

        {/* 액션 카드 2개 */}
        <div className="flex justify-between gap-[14px]">
          <button
            type="button"
            onClick={() => navigate('/semo/create')}
            className="flex h-[80px] w-[170px] flex-col items-start justify-start gap-[12px] rounded-[16px] bg-[#346E90] px-[16px] py-[14px] text-[14px] font-bold leading-[1.2] text-white"
          >
            <img src={plusIcon} alt="" className="h-[23px] w-[23px] brightness-0 invert" />
            <span>새 세모 만들기</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/join')}
            className="flex h-[80px] w-[170px] flex-col items-start justify-start gap-[12px] rounded-[16px] bg-[#DDEEF5] px-[16px] py-[14px] text-[14px] font-bold leading-[1.2] text-[#346E90]"
          >
            <img src={linkIcon} alt="" className="h-[23px] w-[23px]" />
            <span>링크로 참여하기</span>
          </button>
        </div>
      </div>

      {/* 참여 중인 세모 */}
      <section className="flex flex-col gap-[13px]">
        <SectionHeader title="참여 중인 세모" onMore={() => navigate('/semo')} />
        <div className="flex flex-col gap-[10px]">
          {joinedList.map((semo) => (
            <SemoCard
              key={semo.id}
              semo={semo}
              variant="compact"
              onClick={() => navigate(`/semo/${semo.id}`)}
            />
          ))}
        </div>
      </section>

      {/* 이어서 보기 */}
      {recentSemo && (
        <section className="flex flex-col gap-[13px]">
          <SectionHeader title="이어서 보기" onMore={() => navigate('/semo')} />
          <SemoCard
            semo={recentSemo}
            variant="featured"
            onClick={() => navigate(`/semo/${recentSemo.id}`)}
          />
        </section>
      )}
    </div>
  );
}