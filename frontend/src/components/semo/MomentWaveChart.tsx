import type { WaveMoment } from '../../api/moment';
import { WAVE_MAX_HEIGHT } from '../../utils/wave';

/**
 * 순간 파형 차트 (피그마: 370 x 351, radius 18, border #DFE9EE, bg #FAFCFD)
 * - 서버가 준 waveHeight만큼 높이가 다른 꼭짓점을 부드러운 곡선으로 연결
 * - 모든 꼭짓점 아래에 점선, 맨 아래에 바닥선, 라벨은 전부 #346E90
 * - 꼭짓점 또는 라벨을 누르면 onSelect(momentId) 호출
 *
 * 곡선 원리: 인접한 두 점 사이를 3차 베지어(C)로 잇되 제어점 y를 각 끝점과 같게 두어
 * 모든 꼭짓점/골짜기에서 접선이 수평 → 부드러운 파도. 골짜기는 바닥까지 내려가지 않고
 * 양옆 꼭짓점 중 낮은 쪽의 일부 높이에 머물러 피그마처럼 이어지는 형태가 됩니다.
 */
interface MomentWaveChartProps {
  moments: WaveMoment[];
  selectedId: string;
  onSelect: (id: string) => void;
}

// 피그마 기준 색상
const WAVE_COLOR = '#346E90';
const GUIDE_COLOR = '#C9DFEA'; // 점선
const BASELINE_COLOR = '#DFE9EE'; // 바닥선

// SVG 좌표계 (viewBox = 카드 크기, 화면 폭에 맞춰 비율 그대로 축소)
const WIDTH = 370;
const HEIGHT = 351;
const BASE_Y = 256; // 바닥선 y좌표 (피그마 기준)

// 꼭짓점 x좌표 범위: 가장 이른 시간 ~ 가장 늦은 시간을 이 구간에 시간 비율대로 배치 (피그마 12:00=91, 17:00=288)
const PEAK_X_MIN = 91;
const PEAK_X_MAX = 288;

/** "14:00" → 분 단위 숫자 */
const toMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const VALLEY_RATIO = 0.35; // 골짜기 높이 = 인접 꼭짓점 중 낮은 쪽 × 0.35
const START_RATIO = 0.15; // 왼쪽 시작점 높이 = 첫 꼭짓점 × 0.15
const END_RATIO = 0.2; // 오른쪽 끝점 높이 = 마지막 꼭짓점 × 0.2

type Point = { x: number; y: number };

/** 두 점 사이를 수평 접선의 S자 곡선으로 연결 */
const curveTo = (from: Point, to: Point) => {
  const midX = (from.x + to.x) / 2;
  return ` C ${midX} ${from.y} ${midX} ${to.y} ${to.x} ${to.y}`;
};

export default function MomentWaveChart({ moments, selectedId, onSelect }: MomentWaveChartProps) {
  const count = moments.length;

  // 시간 순서대로 x좌표 배치 (시간 간격에 비례)
  const minutes = moments.map((m) => toMinutes(m.time));
  const minTime = Math.min(...minutes);
  const span = Math.max(...minutes) - minTime;
  const peakX = minutes.map((t) =>
    span === 0 ? WIDTH / 2 : PEAK_X_MIN + ((t - minTime) / span) * (PEAK_X_MAX - PEAK_X_MIN),
  );

  // 꼭짓점 높이(px)와 좌표
  const heights = moments.map((m) => m.waveHeight * WAVE_MAX_HEIGHT);
  const peaks: Point[] = heights.map((h, i) => ({ x: peakX[i], y: BASE_Y - h }));

  // 경로: 왼쪽 시작 → (꼭짓점 → 골짜기)* → 오른쪽 끝
  const points: Point[] = [{ x: 0, y: BASE_Y - heights[0] * START_RATIO }];
  peaks.forEach((peak, i) => {
    points.push(peak);
    if (i < count - 1) {
      points.push({
        x: (peakX[i] + peakX[i + 1]) / 2,
        y: BASE_Y - Math.min(heights[i], heights[i + 1]) * VALLEY_RATIO,
      });
    }
  });
  points.push({ x: WIDTH, y: BASE_Y - heights[count - 1] * END_RATIO });

  let linePath = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) linePath += curveTo(points[i - 1], points[i]);
  // 곡선 아래 영역(바닥선까지) 채우기
  const areaPath = `${linePath} L ${WIDTH} ${BASE_Y} L 0 ${BASE_Y} Z`;

  return (
    <div className="relative mx-auto aspect-[370/351] w-full max-w-[370px] rounded-[18px] border border-[#DFE9EE] bg-[#FAFCFD]">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="absolute inset-0 h-full w-full overflow-hidden rounded-[18px]">
        <defs>
          {/* 위: 파도색 15% → 아래: 투명 */}
          <linearGradient id="wave-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={WAVE_COLOR} stopOpacity={0.15} />
            <stop offset="100%" stopColor={WAVE_COLOR} stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* 파도 영역 + 선 */}
        <path d={areaPath} fill="url(#wave-fill)" />
        <path d={linePath} fill="none" stroke={WAVE_COLOR} strokeWidth={3} />

        {/* 바닥선 */}
        <line x1={0} y1={BASE_Y} x2={WIDTH} y2={BASE_Y} stroke={BASELINE_COLOR} strokeWidth={1.5} />

        {/* 꼭짓점마다: 바닥까지 이어지는 점선 + 점 */}
        {moments.map((moment, i) => {
          const peak = peaks[i];
          const isSelected = moment.id === selectedId;
          return (
            <g key={moment.id} onClick={() => onSelect(moment.id)} className="cursor-pointer">
              <line
                x1={peak.x}
                y1={peak.y}
                x2={peak.x}
                y2={BASE_Y}
                stroke={GUIDE_COLOR}
                strokeWidth={2}
                strokeDasharray="4 4"
              />
              {/* 선택된 점: 바깥 연한 링 + 채워진 점 / 나머지: 흰 점 + 테두리 */}
              {isSelected && (
                <circle cx={peak.x} cy={peak.y} r={11} fill="#FCFEFF" stroke="rgba(53, 110, 144, 0.2)" strokeWidth={1.5} />
              )}
              <circle
                cx={peak.x}
                cy={peak.y}
                r={isSelected ? 6.5 : 6}
                fill={isSelected ? '#356E90' : '#FFFFFF'}
                stroke={WAVE_COLOR}
                strokeWidth={2.5}
              />
              {/* 터치하기 쉽게 투명한 큰 클릭 영역 */}
              <circle cx={peak.x} cy={peak.y} r={18} fill="transparent" />
            </g>
          );
        })}
      </svg>

      {/* 하단 라벨: 꼭짓점 x좌표와 같은 비율(%)에 배치. 선택 여부와 상관없이 모두 #346E90 */}
      {moments.map((moment, i) => (
        <button
          key={moment.id}
          type="button"
          onClick={() => onSelect(moment.id)}
          style={{
            left: `${(peaks[i].x / WIDTH) * 100}%`,
            top: `${((BASE_Y + 8) / HEIGHT) * 100}%`,
          }}
          className="absolute flex -translate-x-1/2 flex-col items-center gap-[10px] whitespace-nowrap leading-[1.2] text-[#346E90]"
        >
          <span className="text-[12px] font-semibold">{moment.time}</span>
          <span className="text-[11px]">{moment.title}</span>
        </button>
      ))}
    </div>
  );
}