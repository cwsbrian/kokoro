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
 * Google ID 토큰으로 Firebase 로그인
 * (Google OAuth는 컴포넌트에서 useIdTokenAuthRequest 훅으로 처리)
 */
export async function signInWithGoogleIdToken(idToken: string): Promise<User> {
  try {
    const auth = getAuthInstance();
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/d582f426-9aae-493c-a377-bd84604fb787',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authService.ts:signInWithGoogleIdToken',message:'Firebase login with Google ID token',data:{idTokenLength:idToken?.length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    
    const credential = GoogleAuthProvider.credential(idToken);
    const userCredential = await signInWithCredential(auth, credential);
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/d582f426-9aae-493c-a377-bd84604fb787',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authService.ts:firebaseLoginSuccess',message:'Firebase login success',data:{userId:userCredential.user.uid},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    
    return userCredential.user;
  } catch (error: any) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/d582f426-9aae-493c-a377-bd84604fb787',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authService.ts:firebaseLoginError',message:'Firebase login error',data:{errorMessage:error?.message,errorCode:error?.code},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    
    console.error('Google sign in error:', error);
    throw error;
  }
}

/**
 * @deprecated Use signInWithGoogleIdToken with useIdTokenAuthRequest hook instead
 * Google 로그인 (레거시 - 컴포넌트에서 훅 사용 권장)
 */
export async function signInWithGoogle(): Promise<User> {
  throw new Error('signInWithGoogle is deprecated. Use useIdTokenAuthRequest hook in component and call signInWithGoogleIdToken with the id_token.');
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

