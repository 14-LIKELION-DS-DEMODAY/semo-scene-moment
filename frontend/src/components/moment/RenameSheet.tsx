import { useState } from 'react';
import BottomSheet from '../common/BottomSheet';

/**
 * Moment 이름 변경 바텀시트
 * - 입력창에는 현재 이름이 placeholder로 보이고, 새 이름을 입력하면 버튼이 활성화됩니다.
 * - 이름은 최대 30자
 */
const MAX_LENGTH = 30;

interface RenameSheetProps {
  open: boolean;
  currentTitle: string;
  onClose: () => void;
  onSubmit: (title: string) => void;
}

/** 시트가 열릴 때마다 새로 마운트되어 입력값이 초기화됩니다. */
function RenameForm({
  currentTitle,
  onSubmit,
}: {
  currentTitle: string;
  onSubmit: (title: string) => void;
}) {
  const [value, setValue] = useState('');
  const trimmed = value.trim();
  const canSubmit = trimmed.length > 0 && trimmed !== currentTitle;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (canSubmit) onSubmit(trimmed);
      }}
      className="relative h-full"
    >
      <h2 className="absolute left-6 top-[70px] text-[20px] font-bold leading-[1.2] text-black">
        Moment 이름 변경
      </h2>
      <p className="absolute left-6 top-[106px] text-[11px] leading-[1.2] text-[#899CA8]">
        수정한 이름은 모든 참여자에게 표시됩니다.
      </p>

      <div className="absolute left-6 top-[149px] flex w-[354px] flex-col items-end gap-[9px]">
        <label className="flex w-full flex-col gap-[9px]">
          <span className="text-[13px] font-medium leading-[1.2] text-black">Moment 이름</span>
          <input
            value={value}
            maxLength={MAX_LENGTH}
            placeholder={currentTitle}
            onChange={(e) => setValue(e.target.value)}
            className="h-[52px] w-full rounded-[13px] border border-[#DFE9EE] bg-[#F7FAFC] px-4 text-[14px] text-black outline-none placeholder:text-[#899CA8]"
          />
        </label>
        <span className="text-[11px] leading-[1.2] text-[#899CA8]">
          {(value || currentTitle).length}/{MAX_LENGTH}
        </span>
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className={`absolute left-6 top-[268px] h-[55px] w-[354px] rounded-2xl text-[15px] font-bold text-white transition-colors ${
          canSubmit ? 'bg-primary active:brightness-95' : 'cursor-not-allowed bg-primary-disabled'
        }`}
      >
        이름 변경하기
      </button>
    </form>
  );
}

export default function RenameSheet({ open, currentTitle, onClose, onSubmit }: RenameSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose} height={353}>
      <RenameForm currentTitle={currentTitle} onSubmit={onSubmit} />
    </BottomSheet>
  );
}
