import BottomSheet from '../common/BottomSheet';
import CommentInput from './CommentInput';
import { formatCommentTime } from '../../utils/photo';
import type { PhotoComment } from '../../types/photo';

/**
 * 댓글 모두보기 바텀시트
 * - 댓글 목록(이름 / 시간 / 내용) + 하단 댓글 입력창
 */
interface CommentSheetProps {
  open: boolean;
  /** 전체 댓글 수 */
  count: number;
  comments: PhotoComment[];
  draft: string;
  onDraftChange: (value: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export default function CommentSheet({
  open,
  count,
  comments,
  draft,
  onDraftChange,
  onSubmit,
  onClose,
}: CommentSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose} height={574}>
      <h2 className="absolute left-6 top-[70px] text-[20px] font-bold leading-[1.2] text-black">
        댓글 {count}
      </h2>

      {/* 댓글 목록 (넘치면 스크롤) */}
      <ul className="absolute inset-x-6 bottom-[90px] top-[114px] overflow-y-auto">
        {comments.map((comment) => (
          <li key={comment.id} className="border-t border-[#DFE9EE] py-[20px]">
            <div className="flex items-start justify-between">
              <span className="text-[14px] font-semibold leading-[1.2] text-black">
                {comment.author}
              </span>
              <span className="text-[10px] leading-[1.2] text-[#728B9B]">
                {formatCommentTime(comment.createdAt)}
              </span>
            </div>
            <p className="mt-[6px] break-all text-[14px] leading-[1.2] text-black">
              {comment.text}
            </p>
          </li>
        ))}
      </ul>

      <div className="absolute inset-x-6 top-[499px]">
        <CommentInput value={draft} onChange={onDraftChange} onSubmit={onSubmit} />
      </div>
    </BottomSheet>
  );
}
