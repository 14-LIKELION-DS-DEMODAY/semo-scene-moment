import type { ReactNode } from 'react';
import BottomNav from '../components/common/BottomNav';

/**
 * 모바일 뷰포트 레이아웃
 * - 웹 브라우저에서도 모바일 화면처럼 최대 402px로 고정, 가운데 정렬
 * - 하단 탭바 표시 여부(hasBottomNav)와 종류(bottomNavType)를 제어
 *
 * 사용 예)
 *   <MobileLayout hasBottomNav>...</MobileLayout>                          // 홈/마이/참여중인 세모
 *   <MobileLayout hasBottomNav bottomNavType="semo" semoId={id}>...        // 세모 상세
 *   <MobileLayout>...</MobileLayout>                                       // 시작/세모생성/업로드 등
 */
interface MobileLayoutProps {
  children: ReactNode;
  /** 하단 탭바 표시 여부 */
  hasBottomNav?: boolean;
  /** main: 홈/만들기/마이, semo: 세모/사진추가/초대 */
  bottomNavType?: 'main' | 'semo';
  /** bottomNavType="semo"일 때 필요 */
  semoId?: string;
}

export default function MobileLayout({
  children,
  hasBottomNav = false,
  bottomNavType = 'main',
  semoId,
}: MobileLayoutProps) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[402px] flex-col bg-white shadow-sm">
      {/* 페이지 본문: 남는 공간을 모두 차지해서 탭바가 항상 아래에 붙음 */}
      <main className="flex flex-1 flex-col">{children}</main>

      {hasBottomNav && <BottomNav type={bottomNavType} semoId={semoId} />}
    </div>
  );
}
