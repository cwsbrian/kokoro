import { PoemCardsSchema } from '@/schemas/poemSchema';
import type { PoemCard } from '@/types';

/**
 * poems.json 파일에서 시 카드 데이터를 로드하고 검증
 */
export async function loadPoemsFromJSON(): Promise<PoemCard[]> {
  try {
    // Expo 환경에서 assets 폴더의 JSON 파일 로드
    const poemsData = require('@/assets/poems.json');

    // Zod 스키마로 검증
    const validatedPoems = PoemCardsSchema.parse(poemsData);

    return validatedPoems;
  } catch (error) {
    console.error('Failed to load poems:', error);
    throw new Error('Failed to load poems data');
  }
}


