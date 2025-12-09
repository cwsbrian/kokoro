import type {
    AnalysisResult,
    BigFive_Cumulative,
    BigFiveSpectrum,
    KishoTypeResult,
    MBTI_Total,
    MBTIPreference,
    MBTITypeResult,
    PoemCard,
    SwipeDirection,
} from '@/types';

// MBTI 반대 극 매핑
const MBTI_OPPOSITES: Record<string, string> = {
  I: 'E',
  E: 'I',
  S: 'N',
  N: 'S',
  T: 'F',
  F: 'T',
  J: 'P',
  P: 'J',
};

// MRT (Minimum Response Threshold)
export const MRT = 20;

/**
 * MBTI 점수 업데이트
 * Right Swipe: 태그된 극에 가중치 추가
 * Left Swipe: 반대 극에 가중치 추가
 */
export function updateMBTIScore(
  currentTotal: MBTI_Total,
  card: PoemCard,
  direction: SwipeDirection
): MBTI_Total {
  const updated = { ...currentTotal };
  const impact = card.MBTI_Impact;

  if (direction === 'right') {
    // 동의: 태그된 극에 가중치 추가 (양수/음수 모두 처리)
    Object.entries(impact).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== 0) {
        updated[key as keyof MBTI_Total] += Math.abs(value); // 절대값 사용
      }
    });
  } else {
    // 비동의: 반대 극에 가중치 추가
    Object.entries(impact).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== 0) {
        const opposite = MBTI_OPPOSITES[key];
        if (opposite) {
          updated[opposite as keyof MBTI_Total] += Math.abs(value); // 절대값 사용
        }
      }
    });
  }

  return updated;
}

/**
 * Big Five 점수 업데이트
 * Right Swipe: 가중치 그대로 추가
 * Left Swipe: 가중치 부호 반전하여 추가
 */
export function updateBigFiveScore(
  currentCumulative: BigFive_Cumulative,
  card: PoemCard,
  direction: SwipeDirection
): BigFive_Cumulative {
  const updated = { ...currentCumulative };
  const impact = card.BigFive_Impact;

  Object.entries(impact).forEach(([key, value]) => {
    if (value !== undefined) {
      if (direction === 'right') {
        // 동의: 가중치 그대로 추가
        updated[key as keyof BigFive_Cumulative] += value;
      } else {
        // 비동의: 가중치 부호 반전하여 추가
        updated[key as keyof BigFive_Cumulative] += -value;
      }
    }
  });

  return updated;
}

/**
 * MBTI 선호도 % 계산
 * 각 축의 선호도 = 해당 극 점수 / (두 극 점수 합) * 100
 */
export function calculateMBTIPreference(mbtiTotal: MBTI_Total): MBTIPreference {
  const e_i_total = mbtiTotal.E + mbtiTotal.I;
  const s_n_total = mbtiTotal.S + mbtiTotal.N;
  const t_f_total = mbtiTotal.T + mbtiTotal.F;
  const j_p_total = mbtiTotal.J + mbtiTotal.P;

  return {
    E: e_i_total > 0 ? (mbtiTotal.E / e_i_total) * 100 : 50,
    I: e_i_total > 0 ? (mbtiTotal.I / e_i_total) * 100 : 50,
    S: s_n_total > 0 ? (mbtiTotal.S / s_n_total) * 100 : 50,
    N: s_n_total > 0 ? (mbtiTotal.N / s_n_total) * 100 : 50,
    T: t_f_total > 0 ? (mbtiTotal.T / t_f_total) * 100 : 50,
    F: t_f_total > 0 ? (mbtiTotal.F / t_f_total) * 100 : 50,
    J: j_p_total > 0 ? (mbtiTotal.J / j_p_total) * 100 : 50,
    P: j_p_total > 0 ? (mbtiTotal.P / j_p_total) * 100 : 50,
  };
}

/**
 * MBTI 타입 결정 (선호도 50% 초과 기준)
 */
export function determineMBTIType(preferences: MBTIPreference): MBTITypeResult {
  const type =
    (preferences.I > 50 ? 'I' : 'E') +
    (preferences.N > 50 ? 'N' : 'S') +
    (preferences.T > 50 ? 'T' : 'F') +
    (preferences.P > 50 ? 'P' : 'J');

  return {
    type,
    preferences,
  };
}

/**
 * Big Five 최대 누적 가능 점수 계산 (MS)
 * 모든 카드의 절대값 합계
 */
function calculateMaxScore(
  cumulative: BigFive_Cumulative,
  responseCount: number,
  allCards: PoemCard[]
): Record<string, number> {
  // 실제로는 사용자가 스와이프한 카드들의 절대값 합계를 계산해야 하지만,
  // 간단화를 위해 모든 카드의 최대 절대값 합계를 사용
  const maxScores: Record<string, number> = {
    O: 0,
    C: 0,
    E: 0,
    A: 0,
    N: 0,
  };

  // 모든 카드의 절대값 합계 계산 (실제로는 사용자가 본 카드만 계산해야 함)
  allCards.forEach((card) => {
    Object.entries(card.BigFive_Impact).forEach(([key, value]) => {
      if (value !== undefined) {
        maxScores[key] += Math.abs(value);
      }
    });
  });

  // 실제로는 responseCount만큼의 카드에 대한 합계를 계산해야 함
  // 여기서는 간단화를 위해 전체 카드 수를 사용
  const avgMaxScore = allCards.length > 0 ? allCards.length : 1;
  Object.keys(maxScores).forEach((key) => {
    maxScores[key] = (maxScores[key] / avgMaxScore) * responseCount;
  });

  return maxScores;
}

/**
 * Big Five 스펙트럼 점수 계산 (0-100% 정규화)
 * Score(X) = (BigFive_Cumulative.X + MS(X)) / (2 * MS(X)) * 100
 */
export function calculateBigFiveSpectrum(
  cumulative: BigFive_Cumulative,
  responseCount: number,
  allCards: PoemCard[]
): BigFiveSpectrum {
  const maxScores = calculateMaxScore(cumulative, responseCount, allCards);

  const spectrum: BigFiveSpectrum = {
    O: 0,
    C: 0,
    E: 0,
    A: 0,
    N: 0,
  };

  Object.keys(spectrum).forEach((key) => {
    const ms = maxScores[key] || 1; // 0으로 나누기 방지
    const value = cumulative[key as keyof BigFive_Cumulative];
    // 정규화: (value - (-ms)) / (ms - (-ms)) * 100 = (value + ms) / (2 * ms) * 100
    spectrum[key as keyof BigFiveSpectrum] = Math.max(
      0,
      Math.min(100, ((value + ms) / (2 * ms)) * 100)
    );
  });

  return spectrum;
}

/**
 * Kishō Tag 결정
 * Ki: I > 50% ? Inner : Outer
 * Shō: F > 50% ? Harmony : Solitude (A+ 연관)
 * Ten: F > 50% ? Feeling : Logic
 * Ketsu: P > 50% ? Flow : Fixed (O+, C- 연관)
 */
export function determineKishoType(mbtiType: MBTITypeResult): KishoTypeResult {
  const { type, preferences } = mbtiType;

  const ki: 'Inner' | 'Outer' = preferences.I > 50 ? 'Inner' : 'Outer';
  const sho: 'Harmony' | 'Solitude' = preferences.F > 50 ? 'Harmony' : 'Solitude';
  const ten: 'Feeling' | 'Logic' = preferences.F > 50 ? 'Feeling' : 'Logic';
  const ketsu: 'Flow' | 'Fixed' = preferences.P > 50 ? 'Flow' : 'Fixed';

  const fullType = `${ki}-${sho}-${ten}-${ketsu}`;

  return {
    Ki: ki,
    Shō: sho,
    Ten: ten,
    Ketsu: ketsu,
    fullType,
  };
}

/**
 * 전체 분석 결과 계산
 */
export function calculateAnalysisResult(
  mbtiTotal: MBTI_Total,
  bigFiveCumulative: BigFive_Cumulative,
  responseCount: number,
  allCards: PoemCard[]
): AnalysisResult {
  const mbtiPreference = calculateMBTIPreference(mbtiTotal);
  const mbtiType = determineMBTIType(mbtiPreference);
  const bigFive = calculateBigFiveSpectrum(bigFiveCumulative, responseCount, allCards);
  const kisho = determineKishoType(mbtiType);
  const canShowResults = responseCount >= MRT;

  return {
    mbti: mbtiType,
    bigFive,
    kisho,
    canShowResults,
  };
}

/**
 * 초기 점수 객체 생성
 */
export function createInitialMBTITotal(): MBTI_Total {
  return {
    I: 0,
    E: 0,
    S: 0,
    N: 0,
    T: 0,
    F: 0,
    J: 0,
    P: 0,
  };
}

export function createInitialBigFiveCumulative(): BigFive_Cumulative {
  return {
    O: 0,
    C: 0,
    E: 0,
    A: 0,
    N: 0,
  };
}

