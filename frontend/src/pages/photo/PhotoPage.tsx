import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MobileLayout from '../../layouts/MobileLayout';
import Header from '../../components/common/Header';
import CommentInput from '../../components/photo/CommentInput';
import CommentSheet from '../../components/photo/CommentSheet';
import PhotoMenuSheet from '../../components/photo/PhotoMenuSheet';
import ConfirmModal from '../../components/common/ConfirmModal';
import { MOCK_MOMENTS } from '../../api/mockMoments';
import { getMomentPhotos, getPhotoComments } from '../../api/mockPhotos';
import { formatPhotoDate } from '../../utils/photo';
import { photoPath } from '../../utils/routes';
import { NICKNAME_KEY } from '../../utils/storage';
import type { Photo, PhotoComment } from '../../types/photo';
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
 * - 좌우 화살표로 같은 Moment의 이전 / 다음 사진 이동
 * - ⋯ 버튼: 사진 설정 시트, "모두 보기": 댓글 모두보기 시트
 */
interface PhotoViewProps {
  semoId: string;
  momentId: string;
  photos: Photo[];
  index: number;
  /** 원본 비율 보기 여부 (사진을 넘겨도 유지되도록 부모에서 관리) */
  original: boolean;
  onToggleOriginal: () => void;
}

function PhotoView({ semoId, momentId, photos, index, original, onToggleOriginal }: PhotoViewProps) {
  const navigate = useNavigate();
  const photo = photos[index];

  // TODO: 닉네임 저장 방식 확정 후 교체 (현재는 로컬스토리지)
  const nickname = localStorage.getItem(NICKNAME_KEY) ?? '여진';
  const isMine = photo.uploaderName === nickname;

  // TODO: 좋아요 / 댓글 API 연동 (지금은 이 화면 안에서만 바뀜)
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState<PhotoComment[]>(() => getPhotoComments(photo));
  const [draft, setDraft] = useState('');

  const [commentsOpen, setCommentsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const likeCount = photo.likeCount + (liked ? 1 : 0);

  const goTo = (nextIndex: number) => {
    navigate(photoPath(semoId, momentId, photos[nextIndex].id), { replace: true });
  };

  const handleSubmitComment = () => {
    const text = draft.trim();
    if (!text) return;
    setComments((prev) => [
      ...prev,
      { id: `new-${Date.now()}`, author: nickname, text, createdAt: new Date().toISOString() },
    ]);
    setDraft('');
  };

  const handleSave = () => {
    if (photo.url) {
      const link = document.createElement('a');
      link.href = photo.url;
      link.download = `${photo.id}.jpg`;
      link.click();
    }
    setMenuOpen(false);
  };

  // TODO: 다른 Moment로 이동 화면 확정 후 연결
  const handleMove = () => setMenuOpen(false);

  // 삭제 메뉴 → 삭제 확인 모달
  const handleDelete = () => {
    setMenuOpen(false);
    setDeleteOpen(true);
  };

  // TODO: 사진 삭제 API 연동 후 Moment 상세로 이동
  const handleConfirmDelete = () => setDeleteOpen(false);

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
              <img src={photo.url} alt="" className="max-h-full max-w-full object-contain" />
            </div>
          ) : (
            <img src={photo.url} alt="" className="h-[402px] w-full object-cover" />
          )}
        </button>

        {index > 0 && (
          <button
            type="button"
            aria-label="이전 사진"
            onClick={() => goTo(index - 1)}
            className="absolute left-3 top-[189px] h-6 w-6 rotate-180"
          >
            <img src={slideIcon} alt="" className="h-6 w-6" />
          </button>
        )}
        {index < photos.length - 1 && (
          <button
            type="button"
            aria-label="다음 사진"
            onClick={() => goTo(index + 1)}
            className="absolute right-3 top-[189px] h-6 w-6"
          >
            <img src={slideIcon} alt="" className="h-6 w-6" />
          </button>
        )}
      </div>

      {original ? (
        /* 원본 비율: 같은 Moment의 사진 썸네일 목록 */
        <div className="mt-[75px] flex gap-[10px] overflow-x-auto px-6 pb-6 [scrollbar-width:none]">
          {photos.map((item, i) => (
            <button
              key={item.id}
              type="button"
              aria-label="사진 선택"
              onClick={() => goTo(i)}
              className={`h-[80px] w-[80px] shrink-0 overflow-hidden rounded-[10px] border bg-[#F7FAFC] ${
                i === index ? 'border-[#3B7797]' : 'border-[#DFE9EE]'
              }`}
            >
              {item.url && <img src={item.url} alt="" className="h-full w-full object-cover" />}
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
              aria-pressed={liked}
              onClick={() => setLiked((prev) => !prev)}
              className="flex items-center gap-[10px]"
            >
              <img src={liked ? heartFilledIcon : heartIcon} alt="" className="h-6 w-6" />
              <span className="text-[14px] font-medium leading-[1.2] text-black">{likeCount}</span>
            </button>
            <button
              type="button"
              aria-label="댓글 보기"
              onClick={() => setCommentsOpen(true)}
              className="flex items-center gap-[10px]"
            >
              <img src={chatIcon} alt="" className="h-6 w-6" />
              <span className="text-[14px] font-medium leading-[1.2] text-black">
                {comments.length}
              </span>
            </button>
          </div>

          {/* 올린 사람 */}
          <div className="mt-[19px] flex items-center border-t-2 border-[#DFE9EE] pt-[19px]">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[20px] bg-[#DDEEF5] text-[12px] font-bold leading-[1.2] text-[#244C62]">
              {photo.uploaderName}
            </div>
            <span className="ml-[17px] text-[15px] font-semibold leading-[1.2] text-black">
              {photo.uploaderName}의 시선
            </span>
            <span className="ml-auto text-[10px] font-medium leading-[1.2] text-[#6B9FBD]">
              {formatPhotoDate(photo.takenAt)}
            </span>
          </div>

          {/* 댓글 미리보기 */}
          <div className="mt-[19px] flex items-center justify-between border-t-2 border-[#DFE9EE] pt-[23px]">
            <span className="text-[15px] font-semibold leading-[1.2] text-black">
              댓글 {comments.length}
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
            {comments.slice(0, 2).map((comment) => (
              <li key={comment.id} className="flex">
                <span className="w-9 shrink-0 font-semibold">{comment.author}</span>
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
        comments={comments}
        draft={draft}
        onDraftChange={setDraft}
        onSubmit={handleSubmitComment}
        onClose={() => setCommentsOpen(false)}
      />
      <PhotoMenuSheet
        open={menuOpen}
        isMine={isMine}
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
    </MobileLayout>
  );
}

export default function PhotoPage() {
  const { semoId, momentId, photoId } = useParams<{
    semoId: string;
    momentId: string;
    photoId: string;
  }>();

  // TODO: 백엔드 연동 시 API로 조회
  const moment = (semoId ? MOCK_MOMENTS[semoId] : undefined)?.find((m) => m.id === momentId);
  const photos = moment ? getMomentPhotos(moment) : [];
  const index = photos.findIndex((p) => p.id === photoId);
  const [original, setOriginal] = useState(false);

  if (!semoId || !momentId || !moment || index < 0) {
    return (
      <MobileLayout>
        <Header variant="back" title="사진 보기" />
        <p className="py-24 text-center text-xs text-gray-400">사진을 찾을 수 없어요.</p>
      </MobileLayout>
    );
  }

  // 사진이 바뀌면 좋아요 / 댓글 상태가 초기화되도록 key 지정
  return (
    <PhotoView
      key={photos[index].id}
      semoId={semoId}
      momentId={momentId}
      photos={photos}
      index={index}
      original={original}
      onToggleOriginal={() => setOriginal((prev) => !prev)}
    />
  );
}
