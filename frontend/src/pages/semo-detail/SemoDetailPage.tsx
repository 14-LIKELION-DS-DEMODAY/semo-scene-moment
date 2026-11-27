import { useState } from 'react';
import { useParams } from 'react-router-dom';
import MobileLayout from '../../layouts/MobileLayout';
import Header from '../../components/common/Header';
import StatusView from '../../components/common/StatusView';
import EmptySemoView from './EmptySemoView';
import WaveSemoView from './WaveSemoView';
import { getTimeline } from '../../api/moment';
import { useApi } from '../../hooks/useApi';

/**
 * 세모 상세 페이지 (/semo/:semoId)
 * - 껍데기(레이아웃 + 뒤로가기 헤더 + 세모 제목)는 여기서 한 번만 선언
 * - 사진(Moment)이 없으면 EmptySemoView(탭바 없음), 있으면 WaveSemoView(세모 탭바)
 */
function SemoDetail({ semoId }: { semoId: string }) {
  const [date, setDate] = useState<string>();
  const { data: timeline, error, reload } = useApi(`timeline:${semoId}:${date ?? ''}`, () =>
    getTimeline(semoId, date),
  );

  if (error || !timeline) {
    return (
      <MobileLayout>
        <Header variant="back" title="세모 보기" />
        <StatusView error={error} onRetry={reload} />
      </MobileLayout>
    );
  }

  const hasPhotos = !timeline.isEmpty && timeline.moments.length > 0;

  return (
    <MobileLayout hasBottomNav={hasPhotos} bottomNavType="semo" semoId={semoId}>
      <Header variant="back" title="세모 보기" />
      <div className="flex flex-1 flex-col px-6 pb-6 pt-[60px]">
        <h2 className="mb-[20px] text-[26px] font-bold leading-[1.2] text-black">
          {timeline.name}
        </h2>
        {hasPhotos ? (
          <WaveSemoView
            // 날짜가 바뀌면 선택한 Moment 초기화
            key={timeline.selectedDate}
            semoId={semoId}
            dates={timeline.dates}
            selectedDate={timeline.selectedDate}
            onSelectDate={setDate}
            moments={timeline.moments}
          />
        ) : (
          <EmptySemoView semoId={semoId} />
        )}
      </div>
    </MobileLayout>
  );
}

export default function SemoDetailPage() {
  const { semoId = '' } = useParams<{ semoId: string }>();
  // 다른 세모로 이동하면 상태 초기화
  return <SemoDetail key={semoId} semoId={semoId} />;
}
