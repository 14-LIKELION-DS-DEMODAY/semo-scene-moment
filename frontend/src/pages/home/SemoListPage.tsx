import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileLayout from '../../layouts/MobileLayout';
import Header from '../../components/common/Header';
import SemoCard from '../../components/semo/SemoCard';
import StatusView from '../../components/common/StatusView';
import { getSemoList, type SemoSort } from '../../api/home';
import { useApi } from '../../hooks/useApi';
import searchIcon from '../../assets/icons/icon-search.svg';
import chevronDownIcon from '../../assets/icons/icon-chevron-down.svg';

/**
 * 참여 중인 세모 전체보기 (/semo)
 * - 검색: 세모 이름 (입력이 잠깐 멈추면 서버에서 검색)
 * - 정렬: 활동순 / 생성순 / 날짜순 드롭다운
 */
const SORT_OPTIONS: { value: SemoSort; label: string }[] = [
  { value: 'ACTIVITY', label: '활동순' },
  { value: 'CREATED', label: '생성순' },
  { value: 'DATE', label: '날짜순' },
];

export default function SemoListPage() {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [keyword, setKeyword] = useState('');
  const [sortType, setSortType] = useState<SemoSort>('ACTIVITY');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // 글자를 칠 때마다 요청하지 않도록 300ms 멈추면 검색
  useEffect(() => {
    const timer = setTimeout(() => setKeyword(searchQuery.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: semoList, error, reload } = useApi(`semos:${sortType}:${keyword}`, () =>
    getSemoList(keyword, sortType),
  );

  const currentLabel = SORT_OPTIONS.find((o) => o.value === sortType)?.label;

  const handleSelectSort = (value: SemoSort) => {
    setSortType(value);
    setIsDropdownOpen(false);
  };

  return (
    <MobileLayout hasBottomNav bottomNavType="main">
      <Header variant="logo" />

      {/* 로고와 제목 사이 */}
      <div className="flex flex-col px-6 pb-6 pt-[30px]">
        <h2 className="mb-[30px] text-[26px] font-bold leading-[1.2] text-gray-900">
          참여 중인 세모
        </h2>

        {/* 검색창 */}
        <div className="flex h-[46px] w-full max-w-[354px] items-center gap-[15px] rounded-[14px] bg-[#F4F8FA] pl-[20px] pr-4">
          <img src={searchIcon} alt="" className="h-[21px] w-[21px] shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="세모 이름으로 검색"
            className="w-full bg-transparent text-[13px] text-[#728B9B] outline-none placeholder:text-[#728B9B]"
          />
        </div>

        {/* 정렬 드롭다운 */}
        <div className="relative mt-4 mb-[15.4px] flex justify-end">
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="flex items-center gap-1 text-[12px] leading-[1.2] text-[#728B9B]"
          >
            {currentLabel}
            <img
              src={chevronDownIcon}
              alt=""
              className={`h-[7px] w-[7px] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
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
              <ul className="absolute right-[13px] top-full z-20 mt-[1.6px] w-[61px] divide-y-[0.6px] divide-[#346E90] overflow-hidden rounded-[2px] border-[0.6px] border-[#346E90] bg-white">
                {SORT_OPTIONS.filter((option) => option.value !== sortType).map((option) => (
                  <li key={option.value}>
                    <button
                      type="button"
                      onClick={() => handleSelectSort(option.value)}
                      className="flex h-[24px] w-full items-center justify-center text-[12px] text-[#728B9B]"
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
        {error || !semoList ? (
          <StatusView error={error} onRetry={reload} />
        ) : semoList.length === 0 ? (
          <p className="py-16 text-center text-xs text-gray-400">
            {keyword ? '검색 결과가 없어요.' : '아직 참여 중인 세모가 없어요.'}
          </p>
        ) : (
          <div className="flex flex-col gap-[10px]">
            {semoList.map((semo) => (
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