import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import MobileLayout from '../../layouts/MobileLayout';
import Header from '../../components/common/Header';
import CommentInput from '../../components/photo/CommentInput';
import CommentSheet from '../../components/photo/CommentSheet';
import PhotoMenuSheet from '../../components/photo/PhotoMenuSheet';
import ConfirmModal from '../../components/common/ConfirmModal';
import StatusView from '../../components/common/StatusView';
import Toast from '../../components/common/Toast';
import { getMoment, type MomentDetail } from '../../api/moment';
import {
  addComment,
  deletePhoto,
  getComments,
  getPhoto,
  setPhotoLike,
  type PhotoDetail,
} from '../../api/photo';
import { errorMessage } from '../../api/client';
import { useApi } from '../../hooks/useApi';
import { useToast } from '../../hooks/useToast';
import { formatPhotoDate } from '../../utils/photo';
import { momentPath, photoPath, semoPath } from '../../utils/routes';
import dotsIcon from '../../assets/icons/icon-dots.svg';
import heartIcon from '../../assets/icons/icon-heart.svg';
import heartFilledIcon from '../../assets/icons/icon-heart-filled.svg';
import chatIcon from '../../assets/icons/icon-chat.svg';
import slideIcon from '../../assets/icons/icon-slide-next.svg';
import caretIcon from '../../assets/icons/icon-caret-right-small.svg';

/**
 * 사진 보기 페이지 (/semo/:semoId/moments/:momentId/photos/:photoId)
 * - 정사각형 사진 + 좋아요 / 댓글 수 / 올린 사람 / 댓글 미리보기 / 댓글 입력
 * - 사진을 누르면 "원본 비율" 보기로 전환 (하단에 사진 썸네일 목록)
 * - 좌우 화살표로 같은 Moment의 이전 / 다음 사진 이동 (서버 기준으로 순환)
 * - ⋯ 버튼: 사진 설정 시트, "모두 보기": 댓글 모두보기 시트
 */
interface PhotoViewProps {
  semoId: string;
  momentId: string;
  photo: PhotoDetail;
  /** 원본 비율 보기에서 보여줄 같은 Moment의 사진 목록 */
  thumbnails: MomentDetail['photos'];
  /** 원본 비율 보기 여부 (사진을 넘겨도 유지되도록 부모에서 관리) */
  original: boolean;
  onToggleOriginal: () => void;
  onGoTo: (photoId: number) => void;
  /** 댓글이 바뀐 뒤 사진 정보를 다시 조회 */
  onChanged: () => void;
}

function PhotoView({
  semoId,
  momentId,
  photo,
  thumbnails,
  original,
  onToggleOriginal,
  onGoTo,
  onChanged,
}: PhotoViewProps) {
  const navigate = useNavigate();
  const toast = useToast();
  const photoId = String(photo.photoId);

  const [like, setLike] = useState({ liked: photo.liked, likeCount: photo.likeCount });
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);

  const [commentsOpen, setCommentsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // 전체 댓글은 "모두 보기"를 열었을 때 조회 (댓글 수가 바뀌면 다시 조회)
  const allComments = useApi(`comments:${commentsOpen}:${photo.commentCount}`, () =>
    commentsOpen ? getComments(photoId) : Promise.resolve(undefined),
  );

  const hasOthers = photo.nextPhotoId !== null && photo.nextPhotoId !== photo.photoId;

  /** 서버에 변경을 보내는 동안 중복 요청을 막고, 실패하면 알려줌 */
  const run = async (task: () => Promise<void>) => {
    if (busy) return;
    setBusy(true);
    try {
      await task();
    } catch (e) {
      toast.show(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const handleToggleLike = () =>
    run(async () => setLike(await setPhotoLike(photoId, !like.liked)));

  const handleSubmitComment = () => {
    const text = draft.trim();
    if (!text) return;
    run(async () => {
      await addComment(photoId, text);
      setDraft('');
      onChanged();
    });
  };

  // 이미지 서버 주소가 달라서, 받아온 뒤에 저장해야 파일로 내려받아짐
  const handleSave = () => {
    setMenuOpen(false);
    run(async () => {
      const response = await fetch(photo.downloadUrl);
      if (!response.ok) throw new Error('DOWNLOAD_FAILED');
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement('a');
      link.href = url;
      link.download = photo.downloadUrl.split('/').pop() || `photo-${photoId}.jpg`;
      link.click();
      URL.revokeObjectURL(url);
    });
  };

  // TODO: 다른 Moment로 이동 화면 확정 후 연결
  const handleMove = () => setMenuOpen(false);

  // 삭제 메뉴 → 삭제 확인 모달
  const handleDelete = () => {
    setMenuOpen(false);
    setDeleteOpen(true);
  };

  // 마지막 사진이라 Moment가 사라지면 세모 보기로, 아니면 Moment 상세로
  const handleConfirmDelete = () => {
    setDeleteOpen(false);
    run(async () => {
      const { momentDeleted } = await deletePhoto(photoId);
      navigate(momentDeleted ? semoPath(semoId) : momentPath(semoId, momentId), { replace: true });
    });
  };

  return (
    <MobileLayout>
      <Header
        variant="back"
        title="사진 보기"
        rightElement={
          <button
            type="button"
            aria-label="사진 설정"
            onClick={() => setMenuOpen(true)}
            className="-my-[3px] flex h-8 w-8 items-center justify-center"
          >
            <img src={dotsIcon} alt="" className="h-8 w-8" />
          </button>
        }
      />

      {/* 사진 + 이전/다음 화살표 */}
      <div className="relative mt-[26px]">
        <button
          type="button"
          aria-label={original ? '정사각형으로 보기' : '원본 비율로 보기'}
          onClick={onToggleOriginal}
          className="block w-full"
        >
          {original ? (
            <div className="flex h-[556px] w-full items-center justify-center">
              <img src={photo.imageUrl} alt="" className="max-h-full max-w-full object-contain" />
            </div>
          ) : (
            <img src={photo.imageUrl} alt="" className="h-[402px] w-full object-cover" />
          )}
        </button>

        {hasOthers && photo.prevPhotoId !== null && (
          <button
            type="button"
            aria-label="이전 사진"
            onClick={() => onGoTo(photo.prevPhotoId!)}
            className="absolute left-3 top-[189px] h-6 w-6 rotate-180"
          >
            <img src={slideIcon} alt="" className="h-6 w-6" />
          </button>
        )}
        {hasOthers && (
          <button
            type="button"
            aria-label="다음 사진"
            onClick={() => onGoTo(photo.nextPhotoId!)}
            className="absolute right-3 top-[189px] h-6 w-6"
          >
            <img src={slideIcon} alt="" className="h-6 w-6" />
          </button>
        )}
      </div>

      {original ? (
        /* 원본 비율: 같은 Moment의 사진 썸네일 목록 */
        <div className="mt-[75px] flex gap-[10px] overflow-x-auto px-6 pb-6 [scrollbar-width:none]">
          {thumbnails.map((item) => (
            <button
              key={item.photoId}
              type="button"
              aria-label="사진 선택"
              onClick={() => onGoTo(item.photoId)}
              className={`h-[80px] w-[80px] shrink-0 overflow-hidden rounded-[10px] border bg-[#F7FAFC] ${
                item.photoId === photo.photoId ? 'border-[#3B7797]' : 'border-[#DFE9EE]'
              }`}
            >
              <img src={item.thumbnailUrl} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-1 flex-col px-6 pb-[30px]">
          {/* 좋아요 / 댓글 수 */}
          <div className="mt-6 flex items-center gap-[32px]">
            <button
              type="button"
              aria-label="좋아요"
              aria-pressed={like.liked}
              onClick={handleToggleLike}
              className="flex items-center gap-[10px]"
            >
              <img src={like.liked ? heartFilledIcon : heartIcon} alt="" className="h-6 w-6" />
              <span className="text-[14px] font-medium leading-[1.2] text-black">{like.likeCount}</span>
            </button>
            <button
              type="button"
              aria-label="댓글 보기"
              onClick={() => setCommentsOpen(true)}
              className="flex items-center gap-[10px]"
            >
              <img src={chatIcon} alt="" className="h-6 w-6" />
              <span className="text-[14px] font-medium leading-[1.2] text-black">
                {photo.commentCount}
              </span>
            </button>
          </div>

          {/* 올린 사람 */}
          <div className="mt-[19px] flex items-center border-t-2 border-[#DFE9EE] pt-[19px]">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[20px] bg-[#DDEEF5] text-[12px] font-bold leading-[1.2] text-[#244C62]">
              {photo.uploader.nickname.slice(0, 3)}
            </div>
            <span className="ml-[17px] text-[15px] font-semibold leading-[1.2] text-black">
              {photo.uploader.nickname}의 시선
            </span>
            <span className="ml-auto text-[10px] font-medium leading-[1.2] text-[#6B9FBD]">
              {photo.takenAt ? formatPhotoDate(photo.takenAt) : ''}
            </span>
          </div>

          {/* 댓글 미리보기 */}
          <div className="mt-[19px] flex items-center justify-between border-t-2 border-[#DFE9EE] pt-[23px]">
            <span className="text-[15px] font-semibold leading-[1.2] text-black">
              댓글 {photo.commentCount}
            </span>
            <button
              type="button"
              onClick={() => setCommentsOpen(true)}
              className="flex items-center gap-[6px] text-[10px] font-medium leading-[1.2] text-[#6B9FBD]"
            >
              모두 보기
              <img src={caretIcon} alt="" className="h-3 w-3" />
            </button>
          </div>
          <ul className="mt-5 flex flex-col gap-[15.6px] text-[12px] leading-[1.2] text-black">
            {photo.recentComments.map((comment) => (
              <li key={comment.id} className="flex">
                <span className="min-w-9 shrink-0 pr-[6px] font-semibold">{comment.author}</span>
                <span className="truncate">{comment.text}</span>
              </li>
            ))}
          </ul>

          {/* 댓글 입력 */}
          <div className="mt-auto pt-[30px]">
            <CommentInput value={draft} onChange={setDraft} onSubmit={handleSubmitComment} />
          </div>
        </div>
      )}

      <CommentSheet
        open={commentsOpen}
        count={photo.commentCount}
        comments={allComments.data ?? []}
        draft={draft}
        onDraftChange={setDraft}
        onSubmit={handleSubmitComment}
        onClose={() => setCommentsOpen(false)}
      />
      <PhotoMenuSheet
        open={menuOpen}
        isMine={photo.isMine}
        onClose={() => setMenuOpen(false)}
        onMove={handleMove}
        onSave={handleSave}
        onDelete={handleDelete}
      />
      <ConfirmModal
        open={deleteOpen}
        title="사진을 삭제하겠습니까?"
        description={'Moment에서 사진이 사라집니다.\n삭제된 데이터는 되돌릴 수 없습니다.'}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
      />
      <Toast message={toast.message} />
    </MobileLayout>
  );
}

export default function PhotoPage() {
  const {
    semoId = '',
    momentId = '',
    photoId = '',
  } = useParams<{ semoId: string; momentId: string; photoId: string }>();
  const [searchParams] = useSearchParams();
  const participantId = searchParams.get('participantId') ?? undefined;
  const navigate = useNavigate();
  const [original, setOriginal] = useState(false);

  const { data: photo, error, reload } = useApi(`photo:${photoId}:${participantId ?? ''}`, () =>
    getPhoto(photoId, participantId),
  );
  // 원본 비율 보기의 썸네일 목록
  const strip = useApi(`strip:${original}:${momentId}`, () =>
    original ? getMoment(momentId) : Promise.resolve(undefined),
  );

  if (error || !photo) {
    return (
      <MobileLayout>
        <Header variant="back" title="사진 보기" />
        <StatusView error={error} onRetry={reload} />
      </MobileLayout>
    );
  }

  const goTo = (nextId: number) => {
    navigate(
      {
        pathname: photoPath(semoId, momentId, String(nextId)),
        search: participantId ? `?participantId=${participantId}` : '',
      },
      { replace: true },
    );
  };

  const thumbnails = (strip.data?.photos ?? []).filter(
    (p) => !participantId || String(p.participantId) === participantId,
  );

  // 사진이 바뀌면 좋아요 / 입력 중인 댓글 상태가 초기화되도록 key 지정
  return (
    <PhotoView
      key={photo.photoId}
      semoId={semoId}
      momentId={momentId}
      photo={photo}
      thumbnails={thumbnails}
      original={original}
      onToggleOriginal={() => setOriginal((prev) => !prev)}
      onGoTo={goTo}
      onChanged={reload}
    />
  );
}
