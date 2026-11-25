import type { ReactNode } from 'react';
import BottomSheet from '../common/BottomSheet';
import swapIcon from '../../assets/icons/icon-swap.svg';
import downloadIcon from '../../assets/icons/icon-download.svg';
import trashIcon from '../../assets/icons/icon-trash.svg';

/**
 * 사진 설정 바텀시트 (사진 보기 우측 상단 ⋯ 버튼)
 * - 내 사진: 다른 Moment로 이동 / 사진 저장 / Moment에서 사진 삭제
 * - 다른 사람 사진: 다른 Moment로 이동 / 사진 저장
 */
interface PhotoMenuSheetProps {
  open: boolean;
  /** 내가 올린 사진인지 (삭제 메뉴 노출 여부) */
  isMine: boolean;
  onClose: () => void;
  onMove: () => void;
  onSave: () => void;
  onDelete: () => void;
}

function MenuItem({
  top,
  icon,
  onClick,
  children,
}: {
  top: number;
  icon: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ top }}
      className="absolute left-6 flex items-center gap-[12px]"
    >
      <img src={icon} alt="" className="h-[26px] w-[26px]" />
      <span className="text-[14px] font-medium leading-[1.2] text-black">{children}</span>
    </button>
  );
}

export default function PhotoMenuSheet({
  open,
  isMine,
  onClose,
  onMove,
  onSave,
  onDelete,
}: PhotoMenuSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose} height={isMine ? 286 : 240}>
      <h2 className="absolute left-6 top-[70px] text-[20px] font-bold leading-[1.2] text-black">
        사진 설정
      </h2>
      <div className="absolute inset-x-6 top-[114px] border-t border-[#DFE9EE]" />

      <MenuItem top={138} icon={swapIcon} onClick={onMove}>
        다른 Moment로 이동
      </MenuItem>
      <MenuItem top={184} icon={downloadIcon} onClick={onSave}>
        사진 저장
      </MenuItem>
      {isMine && (
        <MenuItem top={230} icon={trashIcon} onClick={onDelete}>
          Moment에서 사진 삭제
        </MenuItem>
      )}
    </BottomSheet>
  );
}
