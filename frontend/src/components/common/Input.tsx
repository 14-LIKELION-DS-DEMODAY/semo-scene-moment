import { useId } from 'react';
import type { InputHTMLAttributes } from 'react';

/**
 * 공통 텍스트 인풋
 * - 상단 라벨 (required면 * 표시)
 * - 입력창
 * - 하단 에러 메시지 + 에러 시 테두리 강조
 *
 * 사용처: 세모 생성(세모 이름/내 닉네임), 참여하기(내 닉네임), 마이페이지(닉네임 변경)
 * value / onChange / placeholder 등 기본 <input> 속성은 그대로 사용 가능합니다.
 */
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  /** 라벨 옆에 * 표시 */
  required?: boolean;
  /** 값이 있으면 에러 상태 (테두리 강조 + 하단 메시지 노출) */
  error?: string;
}

export default function Input({
  label,
  required = false,
  error,
  className = '',
  id,
  ...rest
}: InputProps) {
  // label 클릭 시 input에 포커스가 가도록 id 연결
  const autoId = useId();
  const inputId = id ?? autoId;

  const borderStyle = error
    ? 'border-primary ring-1 ring-primary' // 에러: 메인 컬러로 강조 (시안 기준)
    : 'border-transparent focus:border-primary-border';

  return (
    <div className="flex w-full flex-col gap-2">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-gray-900">
          {label}
          {required && <span className="ml-0.5 text-primary">*</span>}
        </label>
      )}

      <input
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={`h-12 w-full rounded-xl border bg-primary-disabled/50 px-4 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 ${borderStyle} ${className}`}
        {...rest}
      />

      {/* 에러 메시지 (예: "세모 이름을 입력해주세요.") */}
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-primary">
          {error}
        </p>
      )}
    </div>
  );
}
