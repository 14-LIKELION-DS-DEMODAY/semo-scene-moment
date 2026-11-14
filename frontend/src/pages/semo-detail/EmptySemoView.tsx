import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import logoImg from '../../assets/icons/logo.svg';

/**
 * 세모 상세 - 빈 세모 (아직 사진이 없는 상태)
 * - 중앙: 흐릿한 로고 + 바닥선 + 안내 문구
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
      {/* 빈 파형 카드 */}
      <div className="flex h-72 flex-col items-center justify-center gap-4 rounded-2xl border border-primary-border/60 bg-primary-disabled/20 px-6">
        <img src={logoImg} alt="" className="h-16 w-auto opacity-30" />
        <div className="h-px w-full bg-primary-border" />
        <p className="text-[10px] text-gray-400">사진을 추가하면 파도가 나타나요</p>
      </div>

      {/* 하단 버튼: 남는 공간 아래로 밀어냄 */}
      <div className="mt-auto flex flex-col gap-3 pt-6">
        <Button onClick={() => navigate(`/upload/${semoId}`)}>첫 사진 올리기</Button>
        <Button variant="secondary" onClick={() => navigate(`/invite/${semoId}`)}>
          친구 초대하기
        </Button>
      </div>
    </div>
  );
}
