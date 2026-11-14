import { useState } from 'react';
import MomentWaveChart from '../../components/semo/MomentWaveChart';
import { formatKoreanDate } from '../../utils/wave';
import type { Moment } from '../../types/moment';
import chevronRightIcon from '../../assets/icons/icon-chevron-right.svg';

/**
 * 세모 상세 - 사진이 있는 상태
 * - 날짜 필터 알약 버튼 + 파형 차트 + "선택한 순간" 카드
 * - 상태는 2개: selectedDate, selectedMomentId
 */
interface WaveSemoViewProps {
  moments: Moment[];
}

export default function WaveSemoView({ moments }: WaveSemoViewProps) {
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
    <div className="flex flex-col gap-6">
      {/* 날짜 필터 */}
      <div className="flex gap-2 overflow-x-auto">
        {dates.map((date) => (
          <button
            key={date}
            type="button"
            onClick={() => handleSelectDate(date)}
            className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-medium ${
              date === selectedDate ? 'bg-primary text-white' : 'bg-primary-disabled text-primary'
            }`}
          >
            {formatKoreanDate(date)}
          </button>
        ))}
      </div>

      {/* 파형 */}
      <MomentWaveChart
        moments={dayMoments}
        selectedId={selectedMoment.id}
        onSelect={setSelectedMomentId}
      />

      {/* 선택한 순간 */}
      <section className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold text-gray-900">선택한 순간</h3>
        <button
          type="button"
          // TODO: 순간 상세(사진 목록) 라우트 확정 후 연결
          onClick={() => {}}
          className="flex w-full items-center justify-between rounded-[14px] border border-[#DFE9EE] bg-white py-2 pl-2 pr-[9px] text-left"
        >
          <div className="flex items-center gap-3">
            {selectedMoment.thumbnailUrl ? (
              <img
                src={selectedMoment.thumbnailUrl}
                alt=""
                className="h-[67px] w-[69px] shrink-0 rounded-[10px] object-cover"
              />
            ) : (
              <div className="h-[67px] w-[69px] shrink-0 rounded-[10px] bg-[#D9D9D9]" />
            )}
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-black">{selectedMoment.title}</span>
              <span className="flex gap-2 text-[11px] text-black">
                <span>{selectedMoment.photoCount}장</span>
                <span>{selectedMoment.memberCount}명</span>
                <span>{selectedMoment.time}</span>
              </span>
            </div>
          </div>
          <img src={chevronRightIcon} alt="" className="h-3 w-3" />
        </button>
      </section>
    </div>
  );
}