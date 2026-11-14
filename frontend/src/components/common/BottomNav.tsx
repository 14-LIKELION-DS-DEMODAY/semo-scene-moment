import { NavLink } from "react-router-dom";

import homeIcon from "../../assets/icons/nav-home.svg";
import homeIconActive from "../../assets/icons/nav-home-active.svg";
import createIcon from "../../assets/icons/nav-create.svg";
import createIconActive from "../../assets/icons/nav-create-active.svg";
import myIcon from "../../assets/icons/nav-my.svg";
import myIconActive from "../../assets/icons/nav-my-active.svg";
import semoIcon from "../../assets/icons/nav-semo.svg";
import addPhotoIcon from "../../assets/icons/nav-add-photo.svg";
import inviteIcon from "../../assets/icons/nav-invite.svg";

/**
 * 하단 내비게이션 바 (시안상 2종류)
 * - main : [홈] [+ 만들기] [마이]       → 홈 / 참여 중인 세모 / 마이페이지
 * - semo : [세모] [+ 사진추가] [초대]   → 세모 상세 화면 (semoId 필요)
 *
 * NavLink가 현재 URL을 보고 활성 여부(isActive)를 알려주므로
 * 활성 탭은 아이콘/텍스트가 자동으로 메인 컬러로 바뀝니다.
 */
interface BottomNavProps {
  type: "main" | "semo";
  /** type="semo"일 때 필요한 세모 ID */
  semoId?: string;
}

interface TabItem {
  label: string;
  to: string;
  icon: string;
  iconActive: string;
  /** true면 정확히 일치할 때만 활성화 (홈 '/home'이 하위 경로에서 켜지는 것 방지) */
  end?: boolean;
}

// ⚠️ 라우트 경로는 팀 합의된 값으로 맞춰주세요
const MAIN_TABS: TabItem[] = [
  {
    label: "홈",
    to: "/home",
    icon: homeIcon,
    iconActive: homeIconActive,
    end: true,
  },
  {
    label: "만들기",
    to: "/semo/create",
    icon: createIcon,
    iconActive: createIconActive,
  },
  { label: "마이", to: "/my", icon: myIcon, iconActive: myIconActive },
];

const getSemoTabs = (semoId: string): TabItem[] => [
  {
    label: "세모",
    to: `/semo/${semoId}`,
    icon: semoIcon,
    iconActive: semoIcon,
    end: true,
  },
  {
    label: "사진추가",
    to: `/upload/${semoId}`,
    icon: addPhotoIcon,
    iconActive: addPhotoIcon,
  },
  {
    label: "초대",
    to: `/invite/${semoId}`,
    icon: inviteIcon,
    iconActive: inviteIcon,
  },
];

export default function BottomNav({ type, semoId }: BottomNavProps) {
  // semo 타입인데 semoId가 없으면 렌더링하지 않음 (잘못된 링크 방지)
  if (type === "semo" && !semoId) return null;

  const tabs = type === "main" ? MAIN_TABS : getSemoTabs(semoId as string);

  return (
    <nav className="sticky bottom-0 z-10 flex h-16 shrink-0 items-center border-t border-gray-100 bg-white">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className="flex flex-1 flex-col items-center justify-center gap-1"
        >
          {({ isActive }) => (
            <>
              <img
                src={isActive ? tab.iconActive : tab.icon}
                alt=""
                className="h-5 w-5"
              />
              <span
                className={`text-[10px] ${isActive ? "font-semibold text-primary" : "text-gray-400"}`}
              >
                {tab.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
