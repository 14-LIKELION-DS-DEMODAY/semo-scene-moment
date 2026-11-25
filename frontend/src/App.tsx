import { Routes, Route, Navigate } from "react-router-dom";
import StartPage from "./pages/start/StartPage";
import HomePage from "./pages/home/HomePage";
import SemoListPage from "./pages/home/SemoListPage";
import MyPage from "./pages/my/MyPage";
import SemoDetailPage from "./pages/semo-detail/SemoDetailPage";
import SemoCreatePage from "./pages/semo-create";
import InvitePage from "./pages/invite";
import JoinPage from "./pages/join";
import JoinCodePage from "./pages/join/JoinCodePage";
import UploadPage from "./pages/upload";
import AnalysisPage from "./pages/matching/AnalysisPage";
import ResultPage from "./pages/matching/ResultPage";
import ManualPage from "./pages/matching/ManualPage";
import MomentDetailPage from "./pages/moment/MomentDetailPage";
import PhotoPage from "./pages/photo/PhotoPage";

export default function App() {
  return (
    <Routes>
        {/* 시작 */}
        <Route path="/" element={<StartPage />} />

        {/* 홈 / 참여 중인 세모 전체보기 */}
        <Route path="/home" element={<HomePage />} />
        <Route path="/semo" element={<SemoListPage />} />

        {/* 세모 생성 */}
        <Route path="/semo/create" element={<SemoCreatePage />} />

        {/* 세모 상세 */}
        <Route path="/semo/:semoId" element={<SemoDetailPage />} />

        {/* Moment 상세 / 사진 보기 */}
        <Route path="/semo/:semoId/moments/:momentId" element={<MomentDetailPage />} />
        <Route path="/semo/:semoId/moments/:momentId/photos/:photoId" element={<PhotoPage />} />

        {/* 마이페이지 */}
        <Route path="/my" element={<MyPage />} />

        {/* 친구 초대 / 참여 / 사진 업로드*/}
        <Route path="/invite/:semoId" element={<InvitePage />} />
        <Route path="/upload/:semoId" element={<UploadPage />} />
        <Route path="/semo/:semoId/analysis" element={<AnalysisPage />} />
        <Route path="/semo/:semoId/matching" element={<ResultPage />} />
        <Route path="/semo/:semoId/matching/manual" element={<ManualPage />} />
        <Route path="/join" element={<JoinCodePage />} />
        <Route path="/join/:code" element={<JoinPage />} />

        {/* 없는 경로는 시작 화면으로 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  );
}

