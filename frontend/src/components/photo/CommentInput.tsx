import sendIcon from '../../assets/icons/icon-send.svg';
import sendActiveIcon from '../../assets/icons/icon-send-active.svg';

/**
 * 댓글 입력창 (사진 보기 / 댓글 모두보기 공통)
 * - 입력값이 있으면 오른쪽 전송 아이콘이 진한 색으로 바뀝니다.
 * - Enter 또는 전송 아이콘으로 onSubmit 호출
 */
interface CommentInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export default function CommentInput({ value, onChange, onSubmit }: CommentInputProps) {
  const hasText = value.trim().length > 0;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (hasText) onSubmit();
      }}
      className="relative h-[45px] w-full rounded-[14px] border border-[#DFE9EE] bg-[#FAFCFD]"
    >
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="댓글을 남겨보세요."
        className="h-full w-full rounded-[14px] bg-transparent pl-[14px] pr-[48px] text-[12px] text-black outline-none placeholder:text-[#728B9B]"
      />
      <button
        type="submit"
        aria-label="댓글 등록"
        className="absolute right-[14px] top-[10px] h-6 w-6"
      >
        <img src={hasText ? sendActiveIcon : sendIcon} alt="" className="h-6 w-6" />
      </button>
    </form>
  );
}
