import caretImg from '../../assets/icons/icon-caret-right-small.svg'
import type { Moment } from '../../types/moment'
import { formatMomentDateTime } from '../../utils/moment'

interface MatchedMomentCardProps {
  moment: Moment
  onOpen: () => void
}

export default function MatchedMomentCard({ moment, onOpen }: MatchedMomentCardProps) {
  return (
    <li className="flex h-[142px] shrink-0 gap-[14px] rounded-[16px] border border-line bg-white py-[7px] pl-[9px] pr-3">
      {moment.thumbnailUrl ? (
        <img src={moment.thumbnailUrl} alt="" className="h-[126px] w-[118px] shrink-0 rounded-[11px] object-cover" />
      ) : (
        <div className="h-[126px] w-[118px] shrink-0 rounded-[11px] bg-skeleton" />
      )}
      <div className="flex min-w-0 flex-col justify-between py-3">
        <div className="flex flex-col gap-[10px]">
          <p className="text-[17px] font-bold text-black">{moment.title}</p>
          <div className="flex gap-[15px] whitespace-nowrap text-[12px] font-medium text-subtle">
            <span>{formatMomentDateTime(moment)}</span>
            <span>사진 {moment.photoCount}장</span>
            <span>{moment.memberCount}명</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpen}
          className="flex items-center gap-1 self-start text-[11px] font-medium text-primary-dark"
        >
          확인하기
          <img src={caretImg} alt="" className="h-[11px] w-[11px]" />
        </button>
      </div>
    </li>
  )
}
