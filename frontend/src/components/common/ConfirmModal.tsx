import warningIcon from '../../assets/icons/icon-warning-circle.svg';

/**
 * 삭제 확인 모달 (화면 가운데 334 x 250 카드 + 반투명 배경)
 * - 위험한 동작(삭제 등)을 하기 전에 한 번 더 확인할 때 사용
 * - 배경(어두운 영역)을 누르면 취소(onCancel)
 * - description은 줄바꿈(\n)을 그대로 표시
 *
 * 사용 예)
 *   <ConfirmModal
 *     open={open}
 *     title="사진을 삭제하겠습니까?"
 *     description={'Moment에서 사진이 사라집니다.\n삭제된 데이터는 되돌릴 수 없습니다.'}
 *     onCancel={() => setOpen(false)}
 *     onConfirm={handleDelete}
 *   />
 */
interface ConfirmModalProps {
  open: boolean;
  title: string;
  description?: string;
  cancelLabel?: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmModal({
  open,
  title,
  description,
  cancelLabel = '취소',
  confirmLabel = '삭제',
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-y-0 left-1/2 z-40 flex w-full max-w-[402px] -translate-x-1/2 items-center justify-center">
      <button
        type="button"
        aria-label="닫기"
        onClick={onCancel}
        className="absolute inset-0 bg-black/30"
      />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        className="relative flex h-[250px] w-[334px] flex-col items-center overflow-hidden rounded-[20px] bg-white pt-[21px]"
      >
        <img src={warningIcon} alt="" className="h-8 w-8" />
        <h2 className="mt-6 text-[18px] font-semibold leading-[1.2] text-black">{title}</h2>
        {description && (
          <p className="mt-5 whitespace-pre-line text-center text-[12px] font-medium leading-[1.2] text-[#728B9B]">
            {description}
          </p>
        )}

        <div className="absolute inset-x-6 bottom-[22px] flex gap-6">
          <button
            type="button"
            onClick={onCancel}
            className="h-[42px] flex-1 rounded-[13px] border border-[#DFE9EE] bg-[#FAFCFD] text-[13px] font-medium text-black"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-[42px] flex-1 rounded-[13px] bg-[#AB5452] text-[13px] font-medium text-white active:brightness-95"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
