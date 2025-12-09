import { z } from 'zod';

// MBTI Impact Schema
// 주의: 실제 데이터에 음수 값이 있을 수 있으므로 범위를 확장
export const MBTI_ImpactSchema = z.object({
  I: z.number().min(-1.0).max(1.0).optional(),
  E: z.number().min(-1.0).max(1.0).optional(),
  S: z.number().min(-1.0).max(1.0).optional(),
  N: z.number().min(-1.0).max(1.0).optional(),
  T: z.number().min(-1.0).max(1.0).optional(),
  F: z.number().min(-1.0).max(1.0).optional(),
  J: z.number().min(-1.0).max(1.0).optional(),
  P: z.number().min(-1.0).max(1.0).optional(),
});

// Big Five Impact Schema
export const BigFive_ImpactSchema = z.object({
  O: z.number().min(-1.0).max(1.0).optional(),
  C: z.number().min(-1.0).max(1.0).optional(),
  E: z.number().min(-1.0).max(1.0).optional(),
  A: z.number().min(-1.0).max(1.0).optional(),
  N: z.number().min(-1.0).max(1.0).optional(),
});

// Poem Card Schema
export const PoemCardSchema = z.object({
  Poem_ID: z.string().regex(/^P\d+$/),
  Poem_Type: z.enum(['Haiku', 'Senryu', 'Single-Line Poem']),
  Poem_Text_KR: z.string().min(1),
  Poem_Text_JP: z.string(),
  Kisho_Axis: z.enum(['Ki', 'Shō', 'Ten', 'Ketsu']),
  Kisho_Tag: z.enum(['Inner', 'Outer', 'Harmony', 'Solitude', 'Feeling', 'Logic', 'Flow', 'Fixed']),
  Content_Category: z.string(),
  MBTI_Impact: MBTI_ImpactSchema,
  BigFive_Impact: BigFive_ImpactSchema,
});

// Array of Poem Cards Schema
export const PoemCardsSchema = z.array(PoemCardSchema);

// MBTI Total Schema
export const MBTI_TotalSchema = z.object({
  I: z.number().default(0),
  E: z.number().default(0),
  S: z.number().default(0),
  N: z.number().default(0),
  T: z.number().default(0),
  F: z.number().default(0),
  J: z.number().default(0),
  P: z.number().default(0),
});

// Big Five Cumulative Schema
export const BigFive_CumulativeSchema = z.object({
  O: z.number().default(0),
  C: z.number().default(0),
  E: z.number().default(0),
  A: z.number().default(0),
  N: z.number().default(0),
});

// User Scores Schema
export const UserScoresSchema = z.object({
  MBTI_Total: MBTI_TotalSchema,
  BigFive_Cumulative: BigFive_CumulativeSchema,
  Response_Count: z.number().int().min(0).default(0),
  Last_Updated: z.union([z.date(), z.string()]),
});

// Firestore Document Schema
export const FirestoreUserScoresSchema = z.object({
  MBTI_Total: MBTI_TotalSchema,
  BigFive_Cumulative: BigFive_CumulativeSchema,
  Response_Count: z.number().int().min(0),
  Last_Updated: z.union([z.date(), z.string(), z.any()]), // Firestore Timestamp
});

