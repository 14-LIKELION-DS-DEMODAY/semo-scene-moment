import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import InvitePage from './pages/invite'
import SemoCreatePage from './pages/semo-create'
import SemoDetailPage from './pages/semo-detail'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/semo-create" replace />} />
        <Route path="/semo-create" element={<SemoCreatePage />} />
        <Route path="/invite/:semoId" element={<InvitePage />} />
        <Route path="/semo-detail/:semoId" element={<SemoDetailPage />} />
      </Routes>
    </BrowserRouter>
  )
}
