import React, { useState } from 'react';
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
import { signUpWithEmailAndPassword, signInWithGoogle } from '@/services/authService';
import { createUserProfile } from '@/services/firestoreService';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function SignUpScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isDark = colorScheme === 'dark';
  const backgroundColor = isDark ? Colors.dark.background : Colors.light.background;
  const textColor = isDark ? Colors.dark.text : Colors.light.text;
  const tintColor = isDark ? Colors.dark.tint : Colors.light.tint;

  const validateForm = (): boolean => {
    if (!name.trim()) {
      setError('이름을 입력해주세요.');
      return false;
    }

    if (name.trim().length < 2) {
      setError('이름은 최소 2자 이상이어야 합니다.');
      return false;
    }

    if (!email.trim()) {
      setError('이메일을 입력해주세요.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('올바른 이메일 형식이 아닙니다.');
      return false;
    }

    if (!password.trim()) {
      setError('비밀번호를 입력해주세요.');
      return false;
    }

    if (password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      return false;
    }

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return false;
    }

    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    setIsAuthenticating(true);
    setError(null);

    try {
      // 1. Firebase Auth로 계정 생성
      const user = await signUpWithEmailAndPassword(email.trim(), password);
      
      // 2. Firestore에 사용자 프로필 저장
      await createUserProfile(user.uid, {
        name: name.trim(),
        email: email.trim(),
        createdAt: new Date(),
      });

      // 회원가입 성공 후 메인 화면으로 이동
      // onAuthStateChanged가 트리거되어 자동으로 리다이렉트될 수 있지만,
      // 명시적으로 리다이렉트하여 더 빠른 전환 보장
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Sign up error:', error);
      let errorMessage = '회원가입 중 오류가 발생했습니다.';
      
      if (error?.code === 'auth/email-already-in-use') {
        errorMessage = '이미 사용 중인 이메일입니다.';
      } else if (error?.code === 'auth/invalid-email') {
        errorMessage = '올바른 이메일 형식이 아닙니다.';
      } else if (error?.code === 'auth/weak-password') {
        errorMessage = '비밀번호가 너무 약합니다. 더 강한 비밀번호를 사용해주세요.';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsAuthenticating(true);
    setError(null);

    try {
      await signInWithGoogle();
      // Google 로그인 성공 시 메인 화면으로 이동
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Google auth error:', error);
      let errorMessage = 'Google 로그인 중 오류가 발생했습니다.';
      
      if (error?.message?.includes('cancelled')) {
        errorMessage = 'Google 로그인이 취소되었습니다.';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsAuthenticating(false);
    }
  };

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
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              disabled={isAuthenticating}
            >
              <Text style={[styles.backButtonText, { color: tintColor }]}>← 뒤로</Text>
            </TouchableOpacity>
            <Text style={[styles.title, { color: textColor }]}>회원가입</Text>
            <Text style={[styles.subtitle, { color: textColor }]}>
              코코로와 함께 나를 알아가는 여정을 시작하세요
            </Text>
          </View>

          {/* 에러 메시지 */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* 회원가입 폼 */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: textColor }]}>이름</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? '#2A2A2A' : '#F5F5F5',
                    color: textColor,
                    borderColor: isDark ? '#404040' : '#E0E0E0',
                  },
                ]}
                placeholder="이름을 입력하세요"
                placeholderTextColor={isDark ? '#666666' : '#999999'}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                editable={!isAuthenticating}
              />
            </View>

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
                placeholder="비밀번호를 입력하세요 (최소 6자)"
                placeholderTextColor={isDark ? '#666666' : '#999999'}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password-new"
                editable={!isAuthenticating}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: textColor }]}>비밀번호 확인</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? '#2A2A2A' : '#F5F5F5',
                    color: textColor,
                    borderColor: isDark ? '#404040' : '#E0E0E0',
                  },
                ]}
                placeholder="비밀번호를 다시 입력하세요"
                placeholderTextColor={isDark ? '#666666' : '#999999'}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password-new"
                editable={!isAuthenticating}
              />
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: tintColor }]}
              onPress={handleSignUp}
              disabled={isAuthenticating}
            >
              {isAuthenticating ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>회원가입</Text>
              )}
            </TouchableOpacity>

            <View style={styles.loginLink}>
              <Text style={[styles.loginLinkText, { color: textColor }]}>
                이미 계정이 있으신가요?{' '}
              </Text>
              <TouchableOpacity
                onPress={() => router.replace('/login')}
                disabled={isAuthenticating}
              >
                <Text style={[styles.loginLinkButton, { color: tintColor }]}>로그인</Text>
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
                  Google로 시작하기
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
    marginBottom: 32,
  },
  backButton: {
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    lineHeight: 22,
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
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginLinkText: {
    fontSize: 14,
  },
  loginLinkButton: {
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
