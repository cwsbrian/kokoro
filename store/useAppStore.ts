import type {
    AnalysisResult,
    BigFive_Cumulative,
    MBTI_Total,
    PoemCard,
    SwipeDirection,
    UserScores,
} from '@/types';
import {
    calculateAnalysisResult,
    createInitialBigFiveCumulative,
    createInitialMBTITotal,
    updateBigFiveScore,
    updateMBTIScore,
} from '@/utils/scoreCalculator';
import { create } from 'zustand';

interface AppState {
  // State
  poems: PoemCard[];
  currentCardIndex: number;
  mbtiTotal: MBTI_Total;
  bigFiveCumulative: BigFive_Cumulative;
  responseCount: number;
  isLoading: boolean;
  userId: string | null;
  lastUpdated: Date | null;

  // Actions
  loadPoems: (poems: PoemCard[]) => void;
  swipeCard: (direction: SwipeDirection) => void;
  setUserId: (userId: string) => void;
  loadUserScores: (scores: UserScores) => void;
  resetScores: () => void;
  getCurrentCard: () => PoemCard | null;
  getAnalysisResult: () => AnalysisResult;
  shufflePoems: () => void;
}

const initialState = {
  poems: [],
  currentCardIndex: 0,
  mbtiTotal: createInitialMBTITotal(),
  bigFiveCumulative: createInitialBigFiveCumulative(),
  responseCount: 0,
  isLoading: false,
  userId: null,
  lastUpdated: null,
};

export const useAppStore = create<AppState>((set, get) => ({
  ...initialState,

  loadPoems: (poems: PoemCard[]) => {
    set({ poems, currentCardIndex: 0 });
  },

  swipeCard: (direction: SwipeDirection) => {
    const state = get();
    const currentCard = state.poems[state.currentCardIndex];

    if (!currentCard) {
      console.warn('No current card to swipe');
      return;
    }

    // 점수 업데이트
    const newMBTITotal = updateMBTIScore(state.mbtiTotal, currentCard, direction);
    const newBigFiveCumulative = updateBigFiveScore(
      state.bigFiveCumulative,
      currentCard,
      direction
    );

    // 다음 카드로 이동
    const nextIndex = state.currentCardIndex + 1;
    const hasMoreCards = nextIndex < state.poems.length;

    console.log('Swiping card:', {
      currentIndex: state.currentCardIndex,
      nextIndex: hasMoreCards ? nextIndex : 'no more cards',
      direction,
      totalCards: state.poems.length,
    });

    set({
      mbtiTotal: newMBTITotal,
      bigFiveCumulative: newBigFiveCumulative,
      responseCount: state.responseCount + 1,
      currentCardIndex: hasMoreCards ? nextIndex : state.currentCardIndex, // 마지막 카드면 인덱스 유지
      lastUpdated: new Date(),
    });
  },

  setUserId: (userId: string) => {
    set({ userId });
  },

  loadUserScores: (scores: UserScores) => {
    set({
      mbtiTotal: scores.MBTI_Total,
      bigFiveCumulative: scores.BigFive_Cumulative,
      responseCount: scores.Response_Count,
      lastUpdated:
        scores.Last_Updated instanceof Date
          ? scores.Last_Updated
          : new Date(scores.Last_Updated),
    });
  },

  resetScores: () => {
    set({
      mbtiTotal: createInitialMBTITotal(),
      bigFiveCumulative: createInitialBigFiveCumulative(),
      responseCount: 0,
      currentCardIndex: 0,
      lastUpdated: new Date(),
    });
  },

  getCurrentCard: () => {
    const state = get();
    return state.poems[state.currentCardIndex] || null;
  },

  getAnalysisResult: () => {
    const state = get();
    return calculateAnalysisResult(
      state.mbtiTotal,
      state.bigFiveCumulative,
      state.responseCount,
      state.poems
    );
  },

  shufflePoems: () => {
    const state = get();
    const shuffled = [...state.poems];
    // Fisher-Yates shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    set({ poems: shuffled, currentCardIndex: 0 });
  },
}));

