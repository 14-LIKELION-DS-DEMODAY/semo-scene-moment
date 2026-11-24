import { useNavigate } from 'react-router-dom';
import MobileLayout from '../../layouts/MobileLayout';
import Button from '../../components/common/Button';
import logoImg from '../../assets/icons/logo.svg';

/**
 * 시작 화면
 * - 가운데: 세모 로고
 * - 하단: [시작하기](primary) / [초대 코드로 참여하기](secondary)
 * - 하단 탭바 / 헤더 없음
 */
export default function StartPage() {
  const navigate = useNavigate();

  return (
    <MobileLayout>
      {/* 로고 영역 */}
      <div className="flex flex-1 items-start justify-center px-9 pt-[213px]">
        <img src={logoImg} alt="세모" className="w-[246px]" />
      </div>

      {/* 하단 버튼 영역 */}
      <div className="flex flex-col gap-4 px-9 pb-[50px]">
        <Button onClick={() => navigate('/home')}>시작하기</Button>
        <Button variant="secondary" onClick={() => navigate('/join')}>
          초대 코드로 참여하기
        </Button>
      </div>
    </MobileLayout>
  );
}