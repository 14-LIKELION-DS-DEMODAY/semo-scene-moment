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
  nickname: string;
  semoList: SemoItem[];
}

/** 섹션 제목(18px) + "전체보기 >" 링크(#447F9F, 12px) */
function SectionHeader({ title, onMore }: { title: string; onMore: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-[18px] font-semibold text-gray-900">{title}</h3>
      <button
        type="button"
        onClick={onMore}
        className="flex items-center gap-0.5 text-[12px] text-[#447F9F]"
      >
        전체보기
        <img src={chevronRightIcon} alt="" className="h-3 w-3" />
      </button>
    </div>
  );
}

export default function HomeContentView({ nickname, semoList }: HomeContentViewProps) {
  const navigate = useNavigate();

  // 참여 중인 세모: 최대 2개만 노출
  const joinedList = semoList.slice(0, 2);
  // 이어서 보기: 마지막 활동이 가장 최근인 세모 1개
  const recentSemo = [...semoList].sort(
    (a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime(),
  )[0];

  return (
    <div className="flex flex-col gap-[30px] px-6 pb-6 pt-[24px]">
      {/* 인사말 + 액션 카드 2개 */}
      <div className="flex flex-col gap-5">
        <div>
          <h2 className="text-[26px] font-bold leading-tight text-gray-900">
            {nickname}님, 반갑습니다!
          </h2>
          <p className="mt-1 text-[13px] text-gray-400">함께한 순간들을 다시 떠나볼까요?</p>
        </div>

        {/* 액션 카드 2개 */}
        <div className="flex justify-between gap-[14px]">
          <button
            type="button"
            onClick={() => navigate('/semo/create')}
            className="flex h-[80px] w-[170px] flex-col items-start justify-center gap-[10px] rounded-[16px] bg-[#346E90] py-[14px] pl-[16px] pr-4 text-xs font-semibold text-white"
          >
            <img src={plusIcon} alt="" className="h-4 w-4 brightness-0 invert" />
            <span>새 세모 만들기</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/join')}
            className="flex h-[80px] w-[170px] flex-col items-start justify-center gap-[10px] rounded-[16px] bg-[#DDEEF5] py-[14px] pl-[16px] pr-4 text-xs font-semibold text-[#346E90]"
          >
            <img src={linkIcon} alt="" className="h-4 w-4" />
            <span>링크로 참여하기</span>
          </button>
        </div>
      </div>

      {/* 참여 중인 세모 */}
      <section className="flex flex-col gap-3">
        <SectionHeader title="참여 중인 세모" onMore={() => navigate('/semo')} />
        <div className="flex flex-col gap-2">
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
        <section className="flex flex-col gap-3">
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