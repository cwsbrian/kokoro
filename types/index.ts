// MBTI Types
export type MBTIType = 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P';
export type MBTI_Total = Record<MBTIType, number>;

// Big Five Types
export type BigFiveType = 'O' | 'C' | 'E' | 'A' | 'N';
export type BigFive_Cumulative = Record<BigFiveType, number>;

// Kishō Types
export type KishoAxis = 'Ki' | 'Shō' | 'Ten' | 'Ketsu';
export type KishoTag = 'Inner' | 'Outer' | 'Harmony' | 'Solitude' | 'Feeling' | 'Logic' | 'Flow' | 'Fixed';

// Poem Card Types
export type PoemType = 'Haiku' | 'Senryu' | 'Single-Line Poem';

export interface MBTI_Impact {
  I?: number;
  E?: number;
  S?: number;
  N?: number;
  T?: number;
  F?: number;
  J?: number;
  P?: number;
}

export interface BigFive_Impact {
  O?: number;
  C?: number;
  E?: number;
  A?: number;
  N?: number;
}

export interface PoemCard {
  Poem_ID: string;
  Poem_Type: PoemType;
  Poem_Text_KR: string;
  Poem_Text_JP: string;
  Kisho_Axis: KishoAxis;
  Kisho_Tag: KishoTag;
  Content_Category: string;
  MBTI_Impact: MBTI_Impact;
  BigFive_Impact: BigFive_Impact;
}

// User Scores Types
export interface UserScores {
  MBTI_Total: MBTI_Total;
  BigFive_Cumulative: BigFive_Cumulative;
  Response_Count: number;
  Last_Updated: Date | string;
}

// Swipe Direction
export type SwipeDirection = 'right' | 'left';

// Calculated Results
export interface MBTIPreference {
  E: number; // percentage
  I: number;
  S: number;
  N: number;
  T: number;
  F: number;
  J: number;
  P: number;
}

export interface MBTITypeResult {
  type: string; // e.g., "INFP"
  preferences: MBTIPreference;
}

export interface BigFiveSpectrum {
  O: number; // 0-100%
  C: number;
  E: number;
  A: number;
  N: number;
}

export interface KishoTypeResult {
  Ki: 'Inner' | 'Outer';
  Shō: 'Harmony' | 'Solitude';
  Ten: 'Feeling' | 'Logic';
  Ketsu: 'Flow' | 'Fixed';
  fullType: string; // e.g., "Inner-Harmony-Feeling-Flow"
}

export interface AnalysisResult {
  mbti: MBTITypeResult;
  bigFive: BigFiveSpectrum;
  kisho: KishoTypeResult;
  canShowResults: boolean; // MRT >= 20
}

