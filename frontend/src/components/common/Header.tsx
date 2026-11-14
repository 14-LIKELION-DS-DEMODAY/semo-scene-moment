import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import logoImg from '../../assets/icons/logo.svg';
import backImg from '../../assets/icons/icon-back.svg';

/**
 * 상단 헤더 (시안 기준 2가지)
 * - logo : 홈 / 참여 중인 세모 / 마이페이지  → 좌측 세모 로고만
 * - back : 세모 만들기 / 친구 초대하기 / 참여하기 / 사진 업로드 / 세모 보기
 *          → `<` 뒤로가기 + 타이틀 + (선택) 우측 액션
 */
interface HeaderProps {
  variant: 'logo' | 'back';
  /** back 타입에서 노출할 페이지 타이틀 */
  title?: string;
  /** 뒤로가기 동작 커스텀 (기본값: navigate(-1)) */
  onBack?: () => void;
  /** 우측에 넣을 요소 (예: "닫기" 버튼) */
  rightElement?: ReactNode;
}

export default function Header({ variant, title, onBack, rightElement }: HeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  return (
    <header className="flex h-14 shrink-0 items-center justify-between px-5">
      {variant === 'logo' ? (
        // 타입 A: 로고 헤더
        <img src={logoImg} alt="세모" className="h-6 w-auto" />
      ) : (
        // 타입 B: 뒤로가기 헤더
        <div className="flex items-center gap-2">
          <button type="button" onClick={handleBack} aria-label="뒤로가기" className="-ml-1 p-1">
            <img src={backImg} alt="" className="h-4 w-4" />
          </button>
          {title && <h1 className="text-sm font-semibold text-gray-900">{title}</h1>}
        </div>
      )}

      {/* 우측 선택 요소 (닫기 등). 없으면 비워둠 */}
      <div className="text-xs text-primary">{rightElement}</div>
    </header>
  );
}
