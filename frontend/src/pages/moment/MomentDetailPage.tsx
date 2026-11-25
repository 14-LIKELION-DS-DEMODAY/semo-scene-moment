import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MobileLayout from '../../layouts/MobileLayout';
import Header from '../../components/common/Header';
import RenameSheet from '../../components/moment/RenameSheet';
import { MOCK_MOMENTS } from '../../api/mockMoments';
import { getMomentPhotos } from '../../api/mockPhotos';
import { formatClock } from '../../utils/photo';
import { photoPath } from '../../utils/routes';
import pencilIcon from '../../assets/icons/icon-pencil.svg';

/**
 * Moment 상세 페이지 (/semo/:semoId/moments/:momentId)
 * - Moment 이름(연필 아이콘으로 수정) / 시간 범위 / 대표 사진
 * - 올린 사람별 필터 알약 + 사진 그리드(4열)
 * - 사진을 누르면 사진 보기 화면으로 이동
 */
const ALL = '전체';

export default function MomentDetailPage() {
  const { semoId, momentId } = useParams<{ semoId: string; momentId: string }>();
  const navigate = useNavigate();

  // TODO: 백엔드 연동 시 semoId / momentId로 API 조회
  const moment = (semoId ? MOCK_MOMENTS[semoId] : undefined)?.find((m) => m.id === momentId);
  const photos = useMemo(() => (moment ? getMomentPhotos(moment) : []), [moment]);

  // TODO: 이름 변경 API 연동 (지금은 이 화면 안에서만 바뀜)
  const [title, setTitle] = useState(moment?.title ?? '');
  const [filter, setFilter] = useState(ALL);
  const [renameOpen, setRenameOpen] = useState(false);

  if (!semoId || !moment) {
    return (
      <MobileLayout>
        <Header variant="back" title="Moment 보기" />
        <p className="py-24 text-center text-xs text-gray-400">Moment를 찾을 수 없어요.</p>
      </MobileLayout>
    );
  }

  const uploaders = Array.from(new Set(photos.map((p) => p.uploaderName)));
  const visiblePhotos = filter === ALL ? photos : photos.filter((p) => p.uploaderName === filter);
  const cover = photos[0];
  const timeRange = photos.length
    ? `${formatClock(photos[0].takenAt)}~${formatClock(photos[photos.length - 1].takenAt)}`
    : moment.time;

  const handleRename = (nextTitle: string) => {
    setTitle(nextTitle);
    setRenameOpen(false);
  };

  return (
    <MobileLayout>
      <Header variant="back" title="Moment 보기" />

      <div className="flex flex-col px-6 pb-6 pt-[60px]">
        {/* 이름 + 수정 */}
        <div className="flex items-center gap-[10px]">
          <h2 className="text-[26px] font-bold leading-[1.2] text-black">{title}</h2>
          <button
            type="button"
            aria-label="Moment 이름 수정"
            onClick={() => setRenameOpen(true)}
            className="shrink-0"
          >
            <img src={pencilIcon} alt="" className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-[20px] text-[14px] leading-[1.2] text-black">{timeRange}</p>

        {/* 대표 사진 */}
        <div className="mt-[30px] flex h-[233px] w-full items-center justify-center overflow-hidden rounded-[15px] bg-[#D9D9D9]">
          {cover?.url ? (
            <img src={cover.url} alt="대표 사진" className="h-full w-full object-cover" />
          ) : (
            <span className="text-[14px] leading-[1.2] text-black">대표 사진</span>
          )}
        </div>

        {/* 올린 사람 필터 */}
        <div className="mt-[30px] flex gap-[10px] overflow-x-auto [scrollbar-width:none]">
          {[ALL, ...uploaders].map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setFilter(name)}
              className={`shrink-0 rounded-[12px] px-[16px] py-[6px] text-[11px] font-medium leading-[1.2] ${
                name === filter ? 'bg-[#346E90] text-[#F4F8FA]' : 'bg-[#DDEEF5] text-[#346E90]'
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        {/* 사진 그리드 */}
        <div className="mt-[30px] grid grid-cols-[repeat(4,80px)] gap-[10px]">
          {visiblePhotos.map((photo) => (
            <button
              key={photo.id}
              type="button"
              aria-label="사진 보기"
              onClick={() => navigate(photoPath(semoId, moment.id, photo.id))}
              className="h-[80px] w-[80px] overflow-hidden rounded-[10px] border border-[#DFE9EE] bg-[#F7FAFC]"
            >
              {photo.url && <img src={photo.url} alt="" className="h-full w-full object-cover" />}
            </button>
          ))}
        </div>
      </div>

      <RenameSheet
        open={renameOpen}
        currentTitle={title}
        onClose={() => setRenameOpen(false)}
        onSubmit={handleRename}
      />
    </MobileLayout>
  );
}
