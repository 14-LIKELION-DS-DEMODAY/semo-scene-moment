import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import emptyWaveImg from '../../assets/icons/empty-wave.svg';
import semoIconEmptyImg from '../../assets/icons/semo-icon-empty.svg';

/**
 * 세모 상세 - 빈 세모 (아직 사진이 없는 상태)
 * - 중앙: 흐릿한 세모 아이콘 + 빈 파형선 + 안내 문구 (카드 370 x 351)
 * - 하단: [첫 사진 올리기](primary) / [친구 초대하기](secondary)
 * - 하단 탭바는 없음 (SemoDetailPage에서 hasBottomNav=false로 처리)
 */
interface EmptySemoViewProps {
  semoId: string;
}

export default function EmptySemoView({ semoId }: EmptySemoViewProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-1 flex-col">
      {/* 빈 파형 카드 (피그마 카드 폭 370px: 좌우 여백 16px) */}
      <div className="relative -mx-2 h-[351px] rounded-[18px] border border-[#DFE9EE] bg-[#FAFCFD]">
        <img
          src={semoIconEmptyImg}
          alt=""
          className="absolute left-1/2 top-[96px] h-[100px] w-[100px] -translate-x-1/2"
        />
        <img
          src={emptyWaveImg}
          alt=""
          className="absolute left-[17px] top-[216px] h-[84px] w-[334px]"
        />
        <p className="absolute left-1/2 top-[313px] -translate-x-1/2 whitespace-nowrap text-[12px] leading-[1.2] text-[#346E90]">
          사진을 추가하면 파도가 나타나요
        </p>
      </div>

      {/* 하단 버튼: 남는 공간 아래로 밀어냄 (화면 하단에서 50px) */}
      <div className="mt-auto flex flex-col gap-[15px] pb-[26px] pt-6">
        <Button onClick={() => navigate(`/upload/${semoId}`)}>첫 사진 올리기</Button>
        <Button variant="secondary" onClick={() => navigate(`/invite/${semoId}`)}>
          친구 초대하기
        </Button>
      </div>
    </div>
  );
}
