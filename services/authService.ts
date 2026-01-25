import { getAuthInstance } from '@/lib/firebase';
import { signInWithCustomToken, signInAnonymously, User } from 'firebase/auth';

/**
 * __initial_auth_token을 사용한 자동 인증
 * 토큰이 없으면 익명 인증 사용
 */
export async function authenticateUser(
  initialAuthToken?: string
): Promise<User> {
  try {
    const auth = getAuthInstance();

    if (initialAuthToken) {
      // Custom Token으로 인증
      const userCredential = await signInWithCustomToken(auth, initialAuthToken);
      return userCredential.user;
    } else {
      // 익명 인증
      const userCredential = await signInAnonymously(auth);
      return userCredential.user;
    }
  } catch (error: any) {
    // auth/configuration-not-found 에러 처리
    if (error?.code === 'auth/configuration-not-found') {
      console.error('Firebase Auth configuration error:', {
        code: error.code,
        message: error.message,
        firebaseConfig: {
          projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'not set',
          appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || 'not set',
        },
      });
      throw new Error(
        `Firebase Auth configuration not found. This usually means:\n1. Anonymous Authentication is not enabled in Firebase Console\n   → Go to Firebase Console > Authentication > Sign-in method > Enable "Anonymous"\n2. The Web app doesn't exist in Firebase Console\n   → Go to Firebase Console > Project Settings > General > Add Web app\n3. EXPO_PUBLIC_FIREBASE_APP_ID is incorrect\n   → Check .env file and restart Expo server`
      );
    }
    console.error('Authentication error:', error);
    throw error;
  }
}

/**
 * 현재 사용자 ID 반환
 */
export function getCurrentUserId(): string | null {
  const auth = getAuthInstance();
  return auth.currentUser?.uid || null;
}

/**
 * 현재 사용자 반환
 */
export function getCurrentUser(): User | null {
  const auth = getAuthInstance();
  return auth.currentUser;
}

