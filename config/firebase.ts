// Firebase configuration
// 환경 변수에서 가져오거나 app.json의 extra 필드에서 가져올 수 있습니다.
// 실제 프로덕션에서는 환경 변수를 사용하는 것이 좋습니다.

// google-services.json에서 가져온 기본값 (필요시 환경 변수로 덮어쓰기)
// 주의: Web 앱 ID는 Firebase Console > 프로젝트 설정 > 일반 > 내 앱에서 확인해야 합니다.
// .env 파일에 EXPO_PUBLIC_FIREBASE_APP_ID가 설정되어 있어야 합니다.

// 환경 변수에서 직접 읽기 (Expo는 EXPO_PUBLIC_ 접두사를 자동으로 처리)
const getEnvVar = (key: string, defaultValue: string): string => {
  // @ts-ignore - Expo 환경 변수는 런타임에 사용 가능
  const value = typeof process !== 'undefined' && process.env?.[key];
  return value || defaultValue;
};

const defaultConfig = {
  apiKey: 'AIzaSyC_E8MXntS-NsKVNSgNyrzRXxw8KKVFTCk',
  authDomain: 'kokoro-dfaf5.firebaseapp.com',
  projectId: 'kokoro-dfaf5',
  storageBucket: 'kokoro-dfaf5.firebasestorage.app',
  messagingSenderId: '197937887994',
  // .env 파일에서 가져오거나 기본값 사용
  appId: '1:197937887994:web:d7497eb181972f0b2d6743',
};

// Firebase 설정 - 환경 변수 우선, 없으면 기본값 사용
export const firebaseConfig = {
  apiKey: getEnvVar('EXPO_PUBLIC_FIREBASE_API_KEY', defaultConfig.apiKey),
  authDomain: getEnvVar('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN', defaultConfig.authDomain),
  projectId: getEnvVar('EXPO_PUBLIC_FIREBASE_PROJECT_ID', defaultConfig.projectId),
  storageBucket: getEnvVar('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET', defaultConfig.storageBucket),
  messagingSenderId: getEnvVar('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', defaultConfig.messagingSenderId),
  appId: getEnvVar('EXPO_PUBLIC_FIREBASE_APP_ID', defaultConfig.appId),
};

// Firebase 설정 검증 및 디버깅
if (typeof __DEV__ !== 'undefined' && __DEV__) {
  console.log('Firebase Config:', {
    apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 10)}...` : 'missing',
    projectId: firebaseConfig.projectId,
    appId: firebaseConfig.appId || 'missing',
    hasAppId: !!firebaseConfig.appId,
  });
}

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.warn('Firebase configuration is incomplete. Some features may not work.');
}

if (!firebaseConfig.appId) {
  console.error('Firebase appId is missing! Auth will not work. Please set EXPO_PUBLIC_FIREBASE_APP_ID in .env file.');
}

// App ID for Firestore path
export const APP_ID = process.env.EXPO_PUBLIC_APP_ID || 'kisho-type';

