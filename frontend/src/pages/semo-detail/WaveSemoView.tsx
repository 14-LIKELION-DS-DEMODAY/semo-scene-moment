import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MomentWaveChart from '../../components/semo/MomentWaveChart';
import { formatKoreanDate } from '../../utils/wave';
import { momentPath } from '../../utils/routes';
import type { Moment } from '../../types/moment';
import chevronRightIcon from '../../assets/icons/icon-chevron-right.svg';

/**
 * 세모 상세 - 사진이 있는 상태
 * - 날짜 필터 알약 버튼 + 파형 차트 + "선택한 순간" 카드
 * - 상태는 2개: selectedDate, selectedMomentId
 */
interface WaveSemoViewProps {
  semoId: string;
  moments: Moment[];
}

export default function WaveSemoView({ semoId, moments }: WaveSemoViewProps) {
  const navigate = useNavigate();
  // 날짜 목록 (중복 제거, 등장 순서 유지)
  const dates = Array.from(new Set(moments.map((m) => m.date)));

  const [selectedDate, setSelectedDate] = useState(dates[0]);
  const [selectedMomentId, setSelectedMomentId] = useState<string | null>(null);

  // 선택한 날짜의 Moment만 파형에 표시
  const dayMoments = moments.filter((m) => m.date === selectedDate);

  // 선택된 Moment: 직접 고른 게 없으면 사진이 가장 많은 Moment가 기본값
  const selectedMoment =
    dayMoments.find((m) => m.id === selectedMomentId) ??
    dayMoments.reduce((max, m) => (m.photoCount > max.photoCount ? m : max), dayMoments[0]);

  // 날짜를 바꾸면 선택된 Moment 초기화 (→ 기본값으로 복귀)
  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    setSelectedMomentId(null);
  };

  return (
    <div className="flex flex-col">
      {/* 날짜 필터 */}
      <div className="flex gap-[10px] overflow-x-auto">
        {dates.map((date) => (
          <button
            key={date}
            type="button"
            onClick={() => handleSelectDate(date)}
            className={`shrink-0 rounded-[12px] px-[16px] py-[6px] text-[11px] font-medium leading-[1.2] ${
              date === selectedDate ? 'bg-[#346E90] text-[#F4F8FA]' : 'bg-[#DDEEF5] text-[#346E90]'
            }`}
          >
            {formatKoreanDate(date)}
          </button>
        ))}
      </div>

      {/* 파형 (피그마 카드 폭 370px: 좌우 여백 16px) */}
      <div className="-mx-2 mt-[28px]">
        <MomentWaveChart
          moments={dayMoments}
          selectedId={selectedMoment.id}
          onSelect={setSelectedMomentId}
        />
      </div>

      {/* 선택한 순간 */}
      <section className="mt-6 flex flex-col gap-[10px]">
        <h3 className="text-[16px] font-bold leading-[1.2] text-black">선택한 순간</h3>
        <button
          type="button"
          onClick={() => navigate(momentPath(semoId, selectedMoment.id))}
          className="flex h-[83px] w-full items-center justify-between rounded-[14px] border border-[#DFE9EE] bg-white py-[7px] pl-[7px] pr-[9px] text-left"
        >
          <div className="flex items-center gap-[15px]">
            {selectedMoment.thumbnailUrl ? (
              <img
                src={selectedMoment.thumbnailUrl}
                alt=""
                className="h-[67px] w-[69px] shrink-0 rounded-[10px] object-cover"
              />
            ) : (
              <div className="h-[67px] w-[69px] shrink-0 rounded-[10px] bg-[#D9D9D9]" />
            )}
            <div className="flex flex-col gap-[6px] leading-[1.2]">
              <span className="text-[14px] font-bold text-black">{selectedMoment.title}</span>
              <span className="flex gap-[16px] text-[11px] text-black">
                <span>{selectedMoment.time}</span>
                <span>{selectedMoment.photoCount}장</span>
                <span>{selectedMoment.memberCount}명</span>
              </span>
            </div>
          </div>
          <img src={chevronRightIcon} alt="" className="h-[19px] w-[19px] brightness-0" />
        </button>
      </section>
    </div>
  );
}