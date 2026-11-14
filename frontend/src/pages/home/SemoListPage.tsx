import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileLayout from '../../layouts/MobileLayout';
import Header from '../../components/common/Header';
import SemoCard from '../../components/semo/SemoCard';
import { MOCK_SEMOS } from '../../api/mockSemos';
import type { SemoItem } from '../../types/semo';
import searchIcon from '../../assets/icons/icon-search.svg';
import chevronDownIcon from '../../assets/icons/icon-chevron-down.svg';

/**
 * 참여 중인 세모 전체보기 (/semo)
 * - 검색: 세모 이름으로 실시간 필터링
 * - 정렬: 활동순 / 생성순 / 날짜순 드롭다운
 */
type SortType = 'latest' | 'created' | 'date';

const SORT_OPTIONS: { value: SortType; label: string }[] = [
  { value: 'latest', label: '활동순' },
  { value: 'created', label: '생성순' },
  { value: 'date', label: '날짜순' },
];

const time = (iso: string) => new Date(iso).getTime();

/** 정렬 기준별 비교 함수 (모두 최신이 위로) */
const SORTERS: Record<SortType, (a: SemoItem, b: SemoItem) => number> = {
  latest: (a, b) => time(b.lastActivityAt) - time(a.lastActivityAt),
  created: (a, b) => time(b.createdAt) - time(a.createdAt),
  date: (a, b) => b.date.localeCompare(a.date),
};

export default function SemoListPage() {
  const navigate = useNavigate();

  // TODO: 백엔드 연동 시 API 응답으로 교체
  const semoList: SemoItem[] = MOCK_SEMOS;

  const [searchQuery, setSearchQuery] = useState('');
  const [sortType, setSortType] = useState<SortType>('latest');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const visibleList = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    return semoList
      .filter((semo) => semo.title.toLowerCase().includes(keyword))
      .sort(SORTERS[sortType]);
  }, [semoList, searchQuery, sortType]);

  const currentLabel = SORT_OPTIONS.find((o) => o.value === sortType)?.label;

  const handleSelectSort = (value: SortType) => {
    setSortType(value);
    setIsDropdownOpen(false);
  };

  return (
    <MobileLayout hasBottomNav bottomNavType="main">
      <Header variant="logo" />

      {/* 로고와 제목 사이 */}
      <div className="flex flex-col px-6 pb-6 pt-[30px]">
        <h2 className="mb-[30px] text-[26px] font-bold leading-tight text-gray-900">
          참여 중인 세모
        </h2>

        {/* 검색창 */}
        <div className="flex h-[46px] w-full max-w-[354px] items-center gap-[15px] rounded-[14px] bg-[#F4F8FA] pl-[20px] pr-4">
          <img src={searchIcon} alt="" className="h-4 w-4 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="세모 이름으로 검색"
            className="w-full bg-transparent text-[13px] text-[#728B9B] outline-none placeholder:text-[#728B9B]"
          />
        </div>

        {/* 정렬 드롭다운 */}
        <div className="relative mt-4 mb-3 flex justify-end">
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="flex items-center gap-1 text-[12px] text-[#728B9B]"
          >
            {currentLabel}
            <img
              src={chevronDownIcon}
              alt=""
              className={`h-2.5 w-2.5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {isDropdownOpen && (
            <>
              <button
                type="button"
                aria-label="정렬 메뉴 닫기"
                className="fixed inset-0 z-10 cursor-default"
                onClick={() => setIsDropdownOpen(false)}
              />
              <ul className="absolute right-0 top-full z-20 mt-1 w-[61px] divide-y-[0.6px] divide-[#346E90] overflow-hidden rounded-[2px] border-[0.6px] border-[#346E90] bg-white">
                {SORT_OPTIONS.map((option) => (
                  <li key={option.value}>
                    <button
                      type="button"
                      onClick={() => handleSelectSort(option.value)}
                      className={`flex h-[25px] w-full items-center justify-center text-[12px] ${
                        option.value === sortType ? 'font-semibold text-[#346E90]' : 'text-[#728B9B]'
                      }`}
                    >
                      {option.label}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* 리스트 */}
        {visibleList.length === 0 ? (
          <p className="py-16 text-center text-xs text-gray-400">검색 결과가 없어요.</p>
        ) : (
          <div className="flex flex-col gap-[10px]">
            {visibleList.map((semo) => (
              <SemoCard
                key={semo.id}
                semo={semo}
                variant="detail"
                onClick={() => navigate(`/semo/${semo.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </MobileLayout>
  );
}