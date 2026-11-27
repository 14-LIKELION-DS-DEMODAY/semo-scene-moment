import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import MobileLayout from '../../layouts/MobileLayout';
import Header from '../../components/common/Header';
import StatusView from '../../components/common/StatusView';
import Toast from '../../components/common/Toast';
import RenameSheet from '../../components/moment/RenameSheet';
import { getMoment, renameMoment } from '../../api/moment';
import { errorMessage } from '../../api/client';
import { useApi } from '../../hooks/useApi';
import { useToast } from '../../hooks/useToast';
import { formatClock } from '../../utils/photo';
import { photoPath } from '../../utils/routes';
import pencilIcon from '../../assets/icons/icon-pencil.svg';

/**
 * Moment 상세 페이지 (/semo/:semoId/moments/:momentId)
 * - Moment 이름(연필 아이콘으로 수정) / 시간 범위 / 대표 사진
 * - 올린 사람별 필터 알약 + 사진 그리드(4열)
 * - 사진을 누르면 사진 보기 화면으로 이동
 * - 선택한 필터는 주소(?participantId=)에 남겨서 뒤로 와도 유지
 */
function MomentDetail({ semoId, momentId }: { semoId: string; momentId: string }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const participantId = searchParams.get('participantId');
  const toast = useToast();

  const { data: moment, error, reload } = useApi(`moment:${momentId}`, () => getMoment(momentId));

  const [renamedTitle, setRenamedTitle] = useState<string | null>(null);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);

  if (error || !moment) {
    return (
      <MobileLayout>
        <Header variant="back" title="Moment 보기" />
        <StatusView error={error} onRetry={reload} />
      </MobileLayout>
    );
  }

  const title = renamedTitle ?? moment.name;
  const visiblePhotos = participantId
    ? moment.photos.filter((p) => String(p.participantId) === participantId)
    : moment.photos;
  const timeRange =
    moment.startAt && moment.endAt
      ? `${formatClock(moment.startAt)}~${formatClock(moment.endAt)}`
      : '';
  const filters = [
    { id: null, name: '전체' },
    ...moment.photographers.map((p) => ({ id: String(p.participantId), name: p.nickname })),
  ];

  const selectFilter = (id: string | null) => {
    setSearchParams(id ? { participantId: id } : {}, { replace: true });
  };

  const handleRename = async (nextTitle: string) => {
    if (renaming) return;
    setRenaming(true);
    try {
      const result = await renameMoment(momentId, nextTitle);
      setRenamedTitle(result.name);
      setRenameOpen(false);
    } catch (e) {
      toast.show(errorMessage(e));
    } finally {
      setRenaming(false);
    }
  };

  return (
    <MobileLayout>
      <Header variant="back" title="Moment 보기" />

      <div className="flex flex-col px-6 pb-6 pt-[60px]">
        {/* 이름 + 수정 */}
        <div className="flex items-center gap-[10px]">
          <h2 className="break-all text-[26px] font-bold leading-[1.2] text-black">{title}</h2>
          <button
            type="button"
            aria-label="Moment 이름 수정"
            onClick={() => setRenameOpen(true)}
            className="shrink-0"
          >
            <img src={pencilIcon} alt="" className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-[20px] min-h-[17px] text-[14px] leading-[1.2] text-black">{timeRange}</p>

        {/* 대표 사진 */}
        <div className="mt-[30px] flex h-[233px] w-full items-center justify-center overflow-hidden rounded-[15px] bg-[#D9D9D9]">
          {moment.representativePhotoUrl ? (
            <img
              src={moment.representativePhotoUrl}
              alt="대표 사진"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-[14px] leading-[1.2] text-black">대표 사진</span>
          )}
        </div>

        {/* 올린 사람 필터 */}
        <div className="mt-[30px] flex gap-[10px] overflow-x-auto [scrollbar-width:none]">
          {filters.map((filter) => (
            <button
              key={filter.id ?? 'all'}
              type="button"
              onClick={() => selectFilter(filter.id)}
              className={`shrink-0 rounded-[12px] px-[16px] py-[6px] text-[11px] font-medium leading-[1.2] ${
                filter.id === participantId
                  ? 'bg-[#346E90] text-[#F4F8FA]'
                  : 'bg-[#DDEEF5] text-[#346E90]'
              }`}
            >
              {filter.name}
            </button>
          ))}
        </div>

        {/* 사진 그리드 */}
        <div className="mt-[30px] grid grid-cols-[repeat(4,80px)] gap-[10px]">
          {visiblePhotos.map((photo) => (
            <button
              key={photo.photoId}
              type="button"
              aria-label="사진 보기"
              onClick={() =>
                navigate({
                  pathname: photoPath(semoId, momentId, String(photo.photoId)),
                  search: participantId ? `?participantId=${participantId}` : '',
                })
              }
              className="h-[80px] w-[80px] overflow-hidden rounded-[10px] border border-[#DFE9EE] bg-[#F7FAFC]"
            >
              <img src={photo.thumbnailUrl} alt="" className="h-full w-full object-cover" />
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
      <Toast message={toast.message} />
    </MobileLayout>
  );
}

export default function MomentDetailPage() {
  const { semoId = '', momentId = '' } = useParams<{ semoId: string; momentId: string }>();
  return <MomentDetail key={momentId} semoId={semoId} momentId={momentId} />;
}
