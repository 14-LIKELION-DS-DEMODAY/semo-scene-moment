import { errorMessage } from '../../api/client'

/** 조회 중 / 조회 실패 표시. error가 있으면 문구와 [다시 시도] 버튼 */
interface StatusViewProps {
  error?: unknown
  onRetry?: () => void
}

export default function StatusView({ error, onRetry }: StatusViewProps) {
  return (
    <div className="flex flex-col items-center gap-4 px-6 py-24 text-center text-[13px] text-[#728B9B]">
      <p role="status">{error ? errorMessage(error) : '불러오는 중...'}</p>
      {!!error && onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-[12px] bg-[#DDEEF5] px-4 py-2 font-medium text-[#346E90]"
        >
          다시 시도
        </button>
      )}
    </div>
  )
}
