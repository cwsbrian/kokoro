import { getFirestoreInstance } from '@/lib/firebase';
import {
  doc,
  getDoc,
  setDoc,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { APP_ID } from '@/config/firebase';
import type { UserScores, MBTI_Total, BigFive_Cumulative } from '@/types';
import { UserScoresSchema, FirestoreUserScoresSchema } from '@/schemas/poemSchema';

/**
 * Firestore 경로 헬퍼
 */
function getUserScoresPath(userId: string): string {
  return `artifacts/${APP_ID}/users/${userId}/scores/current_scores`;
}

/**
 * 사용자 점수 조회
 */
export async function getUserScores(userId: string): Promise<UserScores | null> {
  try {
    const db = getFirestoreInstance();
    const docRef = doc(db, getUserScoresPath(userId));
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    // Firestore Timestamp를 Date로 변환
    const lastUpdated =
      data.Last_Updated instanceof Timestamp
        ? data.Last_Updated.toDate()
        : data.Last_Updated;

    const userScores: UserScores = {
      MBTI_Total: data.MBTI_Total as MBTI_Total,
      BigFive_Cumulative: data.BigFive_Cumulative as BigFive_Cumulative,
      Response_Count: data.Response_Count,
      Last_Updated: lastUpdated,
    };

    // Zod 스키마로 검증
    FirestoreUserScoresSchema.parse({
      ...userScores,
      Last_Updated: data.Last_Updated,
    });

    return userScores;
  } catch (error) {
    console.error('Error getting user scores:', error);
    throw error;
  }
}

/**
 * 사용자 점수 업데이트
 */
export async function updateUserScores(
  userId: string,
  scores: UserScores
): Promise<void> {
  try {
    const db = getFirestoreInstance();
    const docRef = doc(db, getUserScoresPath(userId));

    // Zod 스키마로 검증
    UserScoresSchema.parse(scores);

    // Firestore에 저장 (Date는 Timestamp로 변환)
    await setDoc(
      docRef,
      {
        MBTI_Total: scores.MBTI_Total,
        BigFive_Cumulative: scores.BigFive_Cumulative,
        Response_Count: scores.Response_Count,
        Last_Updated: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error updating user scores:', error);
    throw error;
  }
}

/**
 * 초기 사용자 문서 생성
 */
export async function createUserDocument(userId: string): Promise<void> {
  try {
    const db = getFirestoreInstance();
    const docRef = doc(db, getUserScoresPath(userId));

    const initialScores: UserScores = {
      MBTI_Total: {
        I: 0,
        E: 0,
        S: 0,
        N: 0,
        T: 0,
        F: 0,
        J: 0,
        P: 0,
      },
      BigFive_Cumulative: {
        O: 0,
        C: 0,
        E: 0,
        A: 0,
        N: 0,
      },
      Response_Count: 0,
      Last_Updated: new Date(),
    };

    await setDoc(docRef, {
      ...initialScores,
      Last_Updated: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error creating user document:', error);
    throw error;
  }
}

