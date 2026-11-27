import MobileLayout from '../../layouts/MobileLayout';
import Header from '../../components/common/Header';
import StatusView from '../../components/common/StatusView';
import HomeEmptyView from './HomeEmptyView';
import HomeContentView from './HomeContentView';
import { getHome } from '../../api/home';
import { useApi } from '../../hooks/useApi';

/**
 * 홈 페이지 (/home)
 * - 공통 껍데기(레이아웃 + 로고 헤더 + 메인 탭바)는 여기서 한 번만 선언
 * - 참여 중인 세모가 없으면 HomeEmptyView, 있으면 HomeContentView 렌더링
 */
export default function HomePage() {
  const { data: home, error, reload } = useApi('home', getHome);

  return (
    <MobileLayout hasBottomNav bottomNavType="main">
      <Header variant="logo" />
      {error || !home ? (
        <StatusView error={error} onRetry={reload} />
      ) : home.semos.length === 0 ? (
        <HomeEmptyView />
      ) : (
        <HomeContentView
          nickname={home.nickname}
          semoList={home.semos}
          recentSemo={home.recentSemo}
        />
      )}
    </MobileLayout>
  );
}
