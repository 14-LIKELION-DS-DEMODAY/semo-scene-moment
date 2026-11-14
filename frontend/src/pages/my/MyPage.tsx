import { useNavigate } from 'react-router-dom';
import MobileLayout from '../../layouts/MobileLayout';
import Header from '../../components/common/Header';
import { MOCK_SEMOS } from '../../api/mockSemos';
import chevronRightIcon from '../../assets/icons/icon-chevron-right.svg';

/**
 * 마이페이지 (/my)
 * - 기존 사용자(참여 중인 세모 있음): 설정(닉네임 변경, 이용 안내) + 내 활동(기록 삭제)
 * - 신규 사용자(참여 중인 세모 없음): 이용 안내 메뉴만 노출
 */

/* 섹션 제목 */
function SectionTitle({ children }: { children: string }) {
  return <h3 className="mb-3 text-[20px] font-semibold text-black">{children}</h3>;
}

/* 메뉴 한 줄 */
function MenuItem({
  label,
  onClick,
  showArrow = true,
}: {
  label: string;
  onClick: () => void;
  showArrow?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[46px] w-full items-center justify-between rounded-[12px] border border-[#DFE9EE] bg-white px-4 text-left text-[14px] text-black"
    >
      <span>{label}</span>
      {showArrow && (
        <img
          src={chevronRightIcon}
          alt=""
          className="h-[15px] w-[15px] brightness-0"
        />
      )}
    </button>
  );
}

export default function MyPage() {
  const navigate = useNavigate();

  // TODO: 백엔드 연동 시 API 응답으로 교체 (HomePage와 같은 기준으로 신규 여부 판단)
  const isNewUser = MOCK_SEMOS.length === 0;

  // TODO: 닉네임 변경 화면/모달 라우트 확정 후 연결
  const handleChangeNickname = () => navigate('/my/nickname');

  // TODO: 사진 공개 범위 및 이용 안내 페이지 라우트 확정 후 연결
  const handleOpenGuide = () => navigate('/my/guide');

  // 이 기기에 저장된 기록(닉네임 등)을 모두 지우고 시작 화면으로 이동
  const handleDeleteRecords = () => {
    if (!window.confirm('이 기기에서의 기록을 모두 삭제할까요?')) return;
    localStorage.clear();
    navigate('/');
  };

  return (
    <MobileLayout hasBottomNav bottomNavType="main">
      <Header variant="logo" />
      <div className="flex flex-col gap-[30px] px-6 pb-6 pt-[30px]">
        <h2 className="text-[26px] font-bold leading-tight text-black">마이페이지</h2>

        {isNewUser ? (
          // 신규: 이용 안내만
          <MenuItem label="사진 공개 범위 및 이용 안내" onClick={handleOpenGuide} />
        ) : (
          // 기존: 설정 + 내 활동
          <>
            <section>
              <SectionTitle>설정</SectionTitle>
              <div className="flex flex-col gap-2.5">
                <MenuItem label="기본 닉네임 변경" onClick={handleChangeNickname} />
                <MenuItem label="사진 공개 범위 및 이용 안내" onClick={handleOpenGuide} />
              </div>
            </section>

            <section>
              <SectionTitle>내 활동</SectionTitle>
              <MenuItem
                label="이 기기에서의 기록 모두 삭제"
                onClick={handleDeleteRecords}
                showArrow={false}
              />
            </section>
          </>
        )}
      </div>
    </MobileLayout>
  );
}