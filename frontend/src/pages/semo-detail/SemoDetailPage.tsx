import { useParams } from 'react-router-dom';
import MobileLayout from '../../layouts/MobileLayout';
import Header from '../../components/common/Header';
import EmptySemoView from './EmptySemoView';
import WaveSemoView from './WaveSemoView';
import { MOCK_SEMOS } from '../../api/mockSemos';
import { MOCK_MOMENTS } from '../../api/mockMoments';

/**
 * 세모 상세 페이지 (/semo/:semoId)
 * - 껍데기(레이아웃 + 뒤로가기 헤더 + 세모 제목)는 여기서 한 번만 선언
 * - 사진(Moment)이 없으면 EmptySemoView(탭바 없음), 있으면 WaveSemoView(세모 탭바)
 */
export default function SemoDetailPage() {
  const { semoId } = useParams<{ semoId: string }>();

  // TODO: 백엔드 연동 시 semoId로 API 조회
  const semo = MOCK_SEMOS.find((s) => s.id === semoId);
  const moments = (semoId && MOCK_MOMENTS[semoId]) || [];
  const hasPhotos = moments.length > 0;

  // 존재하지 않는 세모
  if (!semoId || !semo) {
    return (
      <MobileLayout>
        <Header variant="back" title="세모 보기" />
        <p className="py-24 text-center text-xs text-gray-400">세모를 찾을 수 없어요.</p>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout hasBottomNav={hasPhotos} bottomNavType="semo" semoId={semoId}>
      <Header variant="back" title="세모 보기" />
      <div className="flex flex-1 flex-col px-6 pb-6 pt-[60px]">
        <h2 className="mb-[20px] text-[26px] font-bold leading-tight text-gray-900">
          {semo.title}
        </h2>
        {hasPhotos ? <WaveSemoView moments={moments} /> : <EmptySemoView semoId={semoId} />}
      </div>
    </MobileLayout>
  );
}