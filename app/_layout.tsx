import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { onAuthStateChanged } from '@/services/authService';
import { User } from 'firebase/auth';

export const unstable_settings = {
  anchor: '(tabs)',
};

function useProtectedRoute() {
  const segments = useSegments();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((authUser) => {
      setUser(authUser);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const currentSegment = segments[0];
    const inAuthGroup = currentSegment === '(tabs)';
    const isAuthPage = currentSegment === 'login' || currentSegment === 'signup';

    if (!user) {
      // 로그인되지 않은 경우
      if (!isAuthPage && !inAuthGroup) {
        // 인증 페이지도 아니고 인증 그룹도 아니면 로그인 페이지로
        router.replace('/login');
      }
    } else {
      // 로그인된 경우
      if (isAuthPage) {
        // 인증 페이지에 있으면 메인 화면으로
        router.replace('/(tabs)');
      } else if (inAuthGroup) {
        // 이미 인증 그룹에 있으면 유지
        // router.replace는 필요 없음 (이미 올바른 위치)
      }
    }
  }, [user, segments, isLoading, router]);

  return { user, isLoading };
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { isLoading } = useProtectedRoute();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colorScheme === 'dark' ? '#fff' : '#0a7ea4'} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="signup" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          <Stack.Screen name="results" options={{ presentation: 'card', title: '분석 결과' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
  },
});
