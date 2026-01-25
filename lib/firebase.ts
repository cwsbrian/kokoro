import { firebaseConfig } from '@/config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirebaseApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth, initializeAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';

// Firebase v9+ React Native persistence
// Firebase v12에서는 getReactNativePersistence가 다른 경로에 있을 수 있음
let getReactNativePersistence: any;
try {
  // 여러 가능한 경로 시도
  try {
    getReactNativePersistence = require('firebase/auth/react-native').getReactNativePersistence;
  } catch (e1) {
    try {
      // Firebase v12에서는 직접 import 시도
      const authModule = require('firebase/auth');
      if (authModule.getReactNativePersistence) {
        getReactNativePersistence = authModule.getReactNativePersistence;
      }
    } catch (e2) {
      // 마지막 시도: 동적 import
      throw new Error('getReactNativePersistence not found');
    }
  }
} catch (e) {
  // getReactNativePersistence가 없는 경우를 대비
  console.warn('getReactNativePersistence not found, using default auth initialization');
  getReactNativePersistence = null;
}

let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;

// Firebase 앱 초기화 (싱글톤 패턴)
export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    const apps = getApps();
    if (apps.length === 0) {
      // Firebase 설정 검증
      if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
        throw new Error('Firebase configuration is missing. Please check your environment variables or firebase config.');
      }
      
      // appId 검증 및 로깅
      if (!firebaseConfig.appId) {
        console.error('Firebase appId is missing! Auth will not work.');
        console.error('Please set EXPO_PUBLIC_FIREBASE_APP_ID in .env file or add Web app in Firebase Console.');
      } else {
        console.log('Firebase appId:', firebaseConfig.appId.substring(0, 20) + '...');
      }
      
      try {
        app = initializeApp(firebaseConfig);
        console.log('Firebase app initialized successfully');
      } catch (error: any) {
        console.error('Firebase initialization error:', error);
        console.error('Firebase config:', {
          apiKey: firebaseConfig.apiKey ? 'set' : 'missing',
          projectId: firebaseConfig.projectId,
          appId: firebaseConfig.appId || 'missing',
        });
        throw error;
      }
    } else {
      app = apps[0];
    }
  }
  return app;
}

// Firestore 인스턴스
export function getFirestoreInstance(): Firestore {
  if (!db) {
    const firebaseApp = getFirebaseApp();
    db = getFirestore(firebaseApp);
  }
  return db;
}

// Auth 인스턴스 (AsyncStorage를 사용한 영구 저장)
// Firebase v12 + Expo SDK 54에서는 getAuth를 직접 사용하는 것이 더 안정적입니다
export function getAuthInstance(): Auth {
  if (!auth) {
    const firebaseApp = getFirebaseApp();
    
    // Firebase v12 + Expo에서는 getAuth를 직접 사용하는 것이 더 안정적
    // initializeAuth는 이미 초기화된 경우 에러를 발생시킬 수 있음
    try {
      // 먼저 getAuth를 시도 (이미 초기화되었을 수 있음)
      auth = getAuth(firebaseApp);
      console.log('Firebase Auth initialized with getAuth');
    } catch (getAuthError: any) {
      // getAuth가 실패하면 initializeAuth 시도
      try {
        if (getReactNativePersistence) {
          // getReactNativePersistence를 사용하여 AsyncStorage와 함께 초기화
          auth = initializeAuth(firebaseApp, {
            persistence: getReactNativePersistence(AsyncStorage),
          });
          console.log('Firebase Auth initialized with AsyncStorage persistence');
        } else {
          // getReactNativePersistence가 없는 경우 기본 초기화
          auth = initializeAuth(firebaseApp);
          console.log('Firebase Auth initialized with default persistence');
        }
      } catch (initError: any) {
        console.error('Error initializing Firebase Auth:', initError);
        throw initError;
      }
    }
  }
  return auth;
}

