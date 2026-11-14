import type { ButtonHTMLAttributes, ReactNode } from 'react';

/**
 * 공통 버튼
 * - primary   : 메인 블루 버튼 (시작하기, 세모 만들기, 선택한 사진 올리기 ...)
 * - secondary : 흰 배경 + 연한 테두리 버튼 (초대 코드로 참여하기, 공유하기, 취소하기 ...)
 * - disabled  : variant와 상관없이 연한 하늘색으로 비활성 처리 (폼 미입력, 사진 0장 선택 등)
 *
 * 색상은 index.css의 @theme 토큰(primary / primary-border / primary-disabled)을 사용합니다.
 */
type ButtonVariant = 'primary' | 'secondary';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  /** 가로 100% 사용 여부 (시안 대부분이 꽉 찬 버튼이라 기본값 true) */
  fullWidth?: boolean;
  children: ReactNode;
}

// variant별 활성 상태 스타일
const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white active:brightness-95',
  secondary: 'bg-white text-primary border border-primary-border active:bg-primary-disabled',
};

// 비활성 상태 스타일 (variant 공통)
const DISABLED_STYLE = 'bg-primary-disabled text-primary/40 cursor-not-allowed';

export default function Button({
  variant = 'primary',
  fullWidth = true,
  disabled = false,
  className = '',
  type = 'button', // form 안에서 의도치 않은 submit 방지
  children,
  ...rest
}: ButtonProps) {
  const base =
    'h-12 px-4 rounded-2xl text-sm font-semibold transition-colors flex items-center justify-center gap-1';
  const width = fullWidth ? 'w-full' : '';
  const style = disabled ? DISABLED_STYLE : VARIANT_STYLES[variant];

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${base} ${width} ${style} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
