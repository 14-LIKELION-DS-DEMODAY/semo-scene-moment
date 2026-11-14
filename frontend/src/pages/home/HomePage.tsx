import MobileLayout from '../../layouts/MobileLayout';
import Header from '../../components/common/Header';
import HomeEmptyView from './HomeEmptyView';
import HomeContentView from './HomeContentView';
import { MOCK_SEMOS } from '../../api/mockSemos';
import type { SemoItem } from '../../types/semo';

/**
 * 홈 페이지 (/home)
 * - 공통 껍데기(레이아웃 + 로고 헤더 + 메인 탭바)는 여기서 한 번만 선언
 * - 참여 중인 세모가 없으면 HomeEmptyView, 있으면 HomeContentView 렌더링
 */
export default function HomePage() {
  // TODO: 백엔드 연동 시 API 응답으로 교체
  const semoList: SemoItem[] = MOCK_SEMOS;

  // TODO: 닉네임 저장 방식 확정 후 교체 (현재는 로컬스토리지)
  const nickname = localStorage.getItem('nickname') ?? '여진';

  return (
    <MobileLayout hasBottomNav bottomNavType="main">
      <Header variant="logo" />
      {semoList.length === 0 ? (
        <HomeEmptyView />
      ) : (
        <HomeContentView nickname={nickname} semoList={semoList} />
      )}
    </MobileLayout>
  );
}
