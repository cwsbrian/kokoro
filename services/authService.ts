import { getAuthInstance } from '@/lib/firebase';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInAnonymously,
  signInWithCredential,
  signInWithCustomToken,
  Unsubscribe,
  User,
} from 'firebase/auth';

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

/**
 * 이메일/비밀번호로 로그인
 */
export async function signInWithEmailAndPassword(
  email: string,
  password: string
): Promise<User> {
  try {
    const auth = getAuthInstance();
    const userCredential = await firebaseSignInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error('Email sign in error:', error);
    throw error;
  }
}

/**
 * 이메일/비밀번호로 회원가입
 */
export async function signUpWithEmailAndPassword(
  email: string,
  password: string
): Promise<User> {
  try {
    const auth = getAuthInstance();
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error('Email sign up error:', error);
    throw error;
  }
}

/**
 * Google 로그인
 */
export async function signInWithGoogle(): Promise<User> {
  try {
    const auth = getAuthInstance();
    
    // Google OAuth 설정
    const discovery = {
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
      revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
    };

    const request = new AuthSession.AuthRequest({
      clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '',
      scopes: ['openid', 'profile', 'email'],
      responseType: AuthSession.ResponseType.IdToken,
      redirectUri: AuthSession.makeRedirectUri({
        scheme: 'kokoro',
        path: 'auth',
      }),
    });

    // OAuth 플로우 시작
    const result = await request.promptAsync(discovery);

    if (result.type === 'success') {
      const { id_token } = result.params;
      
      if (!id_token) {
        throw new Error('No ID token received from Google');
      }

      // Firebase에 Google 인증 정보로 로그인
      const credential = GoogleAuthProvider.credential(id_token);
      const userCredential = await signInWithCredential(auth, credential);
      return userCredential.user;
    } else {
      throw new Error('Google sign in was cancelled or failed');
    }
  } catch (error: any) {
    console.error('Google sign in error:', error);
    throw error;
  }
}

/**
 * 로그아웃
 */
export async function signOut(): Promise<void> {
  try {
    const auth = getAuthInstance();
    await firebaseSignOut(auth);
  } catch (error: any) {
    console.error('Sign out error:', error);
    throw error;
  }
}

/**
 * 인증 상태 변경 리스너
 */
export function onAuthStateChanged(
  callback: (user: User | null) => void
): Unsubscribe {
  const auth = getAuthInstance();
  return firebaseOnAuthStateChanged(auth, callback);
}

// WebBrowser를 완료 처리
WebBrowser.maybeCompleteAuthSession();

