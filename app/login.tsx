import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { Onboarding } from '@/components/Onboarding';
import {
  signInWithEmailAndPassword,
  signInWithGoogleIdToken,
} from '@/services/authService';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

// WebBrowser 세션 완료 처리
WebBrowser.maybeCompleteAuthSession();

const ONBOARDING_KEY = '@kokoro:onboarding_completed';

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isDark = colorScheme === 'dark';
  const backgroundColor = isDark ? Colors.dark.background : Colors.light.background;
  const textColor = isDark ? Colors.dark.text : Colors.light.text;
  const tintColor = isDark ? Colors.dark.tint : Colors.light.tint;

  // Google OAuth 훅 설정
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
  });

  // Google OAuth 응답 처리
  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      handleGoogleIdToken(id_token);
    } else if (response?.type === 'error') {
      console.error('Google auth error:', response.error);
      setError('Google 로그인 중 오류가 발생했습니다.');
      setIsAuthenticating(false);
    } else if (response?.type === 'dismiss') {
      setIsAuthenticating(false);
    }
  }, [response]);

  // 온보딩 완료 여부 확인
  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const completed = await AsyncStorage.getItem(ONBOARDING_KEY);
      if (completed === null) {
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      setShowOnboarding(false);
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      setShowOnboarding(false);
    }
  };

  const handleEmailAuth = async () => {
    if (!email.trim() || !password.trim()) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    if (password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    setIsAuthenticating(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(email.trim(), password);
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Auth error:', error);
      let errorMessage = '로그인 중 오류가 발생했습니다.';
      
      if (error?.code === 'auth/user-not-found') {
        errorMessage = '등록되지 않은 이메일입니다.';
      } else if (error?.code === 'auth/wrong-password') {
        errorMessage = '비밀번호가 올바르지 않습니다.';
      } else if (error?.code === 'auth/invalid-email') {
        errorMessage = '올바른 이메일 형식이 아닙니다.';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Google ID 토큰으로 Firebase 로그인
  const handleGoogleIdToken = async (idToken: string) => {
    try {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/d582f426-9aae-493c-a377-bd84604fb787',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'login.tsx:handleGoogleIdToken',message:'Got ID token from Google',data:{idTokenLength:idToken?.length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      
      await signInWithGoogleIdToken(idToken);
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Firebase auth error:', error);
      let errorMessage = 'Google 로그인 중 오류가 발생했습니다.';
      
      if (error?.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Google 로그인 버튼 핸들러
  const handleGoogleAuth = async () => {
    setIsAuthenticating(true);
    setError(null);

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/d582f426-9aae-493c-a377-bd84604fb787',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'login.tsx:handleGoogleAuth',message:'Starting Google OAuth with useIdTokenAuthRequest',data:{requestReady:!!request},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'E'})}).catch(()=>{});
    // #endregion

    try {
      await promptAsync();
      // 응답은 useEffect에서 처리됨
    } catch (error: any) {
      console.error('Google auth error:', error);
      setError('Google 로그인을 시작할 수 없습니다.');
      setIsAuthenticating(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <ActivityIndicator size="large" color={tintColor} />
      </View>
    );
  }

  if (showOnboarding) {
    return (
      <Onboarding
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingComplete}
      />
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: textColor }]}>코코로</Text>
            <Text style={[styles.subtitle, { color: textColor }]}>
              나만의 성향 분석을 시작하세요
            </Text>
          </View>

          {/* 에러 메시지 */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* 이메일/비밀번호 폼 */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: textColor }]}>이메일</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? '#2A2A2A' : '#F5F5F5',
                    color: textColor,
                    borderColor: isDark ? '#404040' : '#E0E0E0',
                  },
                ]}
                placeholder="이메일을 입력하세요"
                placeholderTextColor={isDark ? '#666666' : '#999999'}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                editable={!isAuthenticating}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: textColor }]}>비밀번호</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? '#2A2A2A' : '#F5F5F5',
                    color: textColor,
                    borderColor: isDark ? '#404040' : '#E0E0E0',
                  },
                ]}
                placeholder="비밀번호를 입력하세요"
                placeholderTextColor={isDark ? '#666666' : '#999999'}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
                editable={!isAuthenticating}
              />
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: tintColor }]}
              onPress={handleEmailAuth}
              disabled={isAuthenticating}
            >
              {isAuthenticating ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>로그인</Text>
              )}
            </TouchableOpacity>

            <View style={styles.signupLink}>
              <Text style={[styles.signupLinkText, { color: textColor }]}>
                계정이 없으신가요?{' '}
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/signup')}
                disabled={isAuthenticating}
              >
                <Text style={[styles.signupLinkButton, { color: tintColor }]}>회원가입</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 구분선 */}
          <View style={styles.divider}>
            <View
              style={[styles.dividerLine, { backgroundColor: isDark ? '#404040' : '#E0E0E0' }]}
            />
            <Text style={[styles.dividerText, { color: textColor }]}>또는</Text>
            <View
              style={[styles.dividerLine, { backgroundColor: isDark ? '#404040' : '#E0E0E0' }]}
            />
          </View>

          {/* Google 로그인 */}
          <TouchableOpacity
            style={[
              styles.googleButton,
              {
                backgroundColor: isDark ? '#2A2A2A' : '#FFFFFF',
                borderColor: isDark ? '#404040' : '#E0E0E0',
              },
            ]}
            onPress={handleGoogleAuth}
            disabled={isAuthenticating}
          >
            {isAuthenticating ? (
              <ActivityIndicator color={textColor} />
            ) : (
              <>
                <Text style={styles.googleIcon}>G</Text>
                <Text style={[styles.googleButtonText, { color: textColor }]}>
                  Google로 로그인
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  errorText: {
    color: '#C62828',
    fontSize: 14,
    textAlign: 'center',
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  primaryButton: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  signupLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  signupLinkText: {
    fontSize: 14,
  },
  signupLinkButton: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    opacity: 0.6,
  },
  googleButton: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4285F4',
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
