import type { ReactNode } from 'react';

/**
 * 바텀시트 (반투명 배경 + 아래에서 올라오는 흰색 시트)
 * - 모바일 화면 폭(402px) 안에서만 표시
 * - 배경(어두운 영역)을 누르면 onClose 호출
 * - children은 시트 안에 absolute로 배치 (시트는 height 고정)
 * - 사용처: Moment 이름 변경, 댓글 모두보기, 사진 설정
 */
interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  /** 시트 높이(px) */
  height: number;
  children: ReactNode;
}

export default function BottomSheet({ open, onClose, height, children }: BottomSheetProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-y-0 left-1/2 z-30 w-full max-w-[402px] -translate-x-1/2">
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/30"
      />
      <div
        style={{ height }}
        className="absolute inset-x-0 bottom-0 overflow-hidden rounded-t-[26px] bg-white"
      >
        {/* 손잡이 */}
        <div className="absolute left-1/2 top-[12px] h-[8px] w-[63px] -translate-x-1/2 rounded-full bg-[#DFE9EE]" />
        {children}
      </div>
    </div>
  );
}
