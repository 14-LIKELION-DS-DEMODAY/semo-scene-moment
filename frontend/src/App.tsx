import { Routes, Route, Navigate } from "react-router-dom";
import StartPage from "./pages/start/StartPage";
import HomePage from "./pages/home/HomePage";
import SemoListPage from "./pages/home/SemoListPage";
import MyPage from "./pages/my/MyPage";
import SemoDetailPage from "./pages/semo-detail/SemoDetailPage";

export default function App() {
  return (
    <Routes>
        {/* 시작 */}
        <Route path="/" element={<StartPage />} />

        {/* 홈 / 참여 중인 세모 전체보기 */}
        <Route path="/home" element={<HomePage />} />
        <Route path="/semo" element={<SemoListPage />} />

        {/* 세모 생성 */}

        {/* 세모 상세 */}
        <Route path="/semo/:semoId" element={<SemoDetailPage />} />

        {/* 마이페이지 */}
        <Route path="/my" element={<MyPage />} />

        {/* 친구 초대 / 참여 / 사진 업로드*/}

        {/* 없는 경로는 시작 화면으로 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  );
}

