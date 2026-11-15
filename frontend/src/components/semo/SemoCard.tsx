import type { SemoItem } from '../../types/semo';

/**
 * 세모 카드 (홈 / 전체보기에서 재사용)
 * - compact  : 홈 "참여 중인 세모" 가로형 작은 카드
 * - detail   : 전체보기 리스트용 카드 (썸네일 + 날짜 + 방장/참여자 뱃지)
 * - featured : 홈 "이어서 보기" 큰 썸네일 카드 (최근 열어봄 뱃지)
 *
 * 썸네일이 없으면 회색 박스로 대체
 */
type SemoCardVariant = 'compact' | 'detail' | 'featured';

interface SemoCardProps {
  semo: SemoItem;
  variant?: SemoCardVariant;
  onClick?: () => void;
}

/** 썸네일 (없으면 회색 플레이스홀더) */
function Thumbnail({ url, className }: { url?: string; className: string }) {
  return url ? (
    <img src={url} alt="" className={`${className} object-cover`} />
  ) : (
    <div className={`${className} bg-[#D9D9D9]`} />
  );
}

/** "26.11.02" 형태로 줄여서 표시 */
const shortDate = (date: string) => date.slice(2);

export default function SemoCard({ semo, variant = 'compact', onClick }: SemoCardProps) {
  const roleLabel = semo.role === 'OWNER' ? '방장' : '참여자';

  // 홈: 작은 가로형 카드
  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex h-[59px] w-full max-w-[354px] items-center gap-[10px] rounded-[14px] border border-[#DFE9EE] bg-white p-[7px] text-left"
      >
        <Thumbnail url={semo.thumbnailUrl} className="h-[45px] w-[45px] shrink-0 rounded-[10px]" />
        <div className="flex flex-col gap-0.5 overflow-hidden">
          <span className="truncate text-[13px] font-semibold text-gray-900">{semo.title}</span>
          <span className="flex gap-2 text-[11px] text-gray-500">
            <span>{semo.photoCount}장</span>
            <span>{semo.memberCount}명</span>
            <span>{shortDate(semo.date)}</span>
          </span>
        </div>
      </button>
    );
  }

  // 홈: 이어서 보기 큰 카드
  if (variant === 'featured') {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex w-full max-w-[354px] flex-col overflow-hidden rounded-[14px] border border-[#DFE9EE] bg-white p-2.5 text-left"
      >
        <div className="relative">
          <Thumbnail url={semo.thumbnailUrl} className="h-40 w-full rounded-[10px]" />
          <span className="absolute left-2.5 top-2.5 flex items-center justify-center gap-[10px] rounded-[13px] bg-white px-[20px] py-[6px] text-[11px] font-medium text-[#346E90]">
            최근 열어봄
          </span>
        </div>
        <div className="mt-3 flex flex-col gap-1 px-0.5 pb-1">
          <span className="text-[18px] font-semibold text-gray-900">{semo.title}</span>
          <span className="flex gap-3 text-[13px] text-gray-500">
            <span>사진 {semo.photoCount}장</span>
            <span>참여자 {semo.memberCount}명</span>
            <span>{shortDate(semo.date)}</span>
          </span>
        </div>
      </button>
    );
  }

  // 전체보기: 썸네일 + 정보 + 뱃지
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[142px] w-full items-center gap-4 rounded-[16px] border border-[#DFE9EE] bg-white p-[8px] text-left"
    >
      {/* 사진 영역 */}
      <Thumbnail url={semo.thumbnailUrl} className="h-[126px] w-[118px] shrink-0 rounded-[11px]" />

      {/* 텍스트 + 역할 태그 */}
      <div className="flex flex-col items-start gap-1.5 overflow-hidden">
        <span className="truncate text-[17px] font-semibold text-black">{semo.title}</span>
        <span className="text-[12px] text-[#728B9B]">{semo.date}</span>
        <span className="flex gap-2 text-[12px] text-[#728B9B]">
          <span>사진 {semo.photoCount}장</span>
          <span>{semo.memberCount}명</span>
        </span>
        <span className="mt-1 flex items-center justify-center gap-[10px] rounded-[12px] bg-[#DDEEF5] px-[16px] py-[6px] text-[11px] font-medium text-[#346E90]">
          {roleLabel}
        </span>
      </div>
    </button>
  );
}