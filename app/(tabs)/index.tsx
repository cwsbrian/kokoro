import { SwipeablePoemCard } from '@/components/SwipeablePoemCard';
import { loadPoemsFromJSON } from '@/data/poemsLoader';
import { authenticateUser } from '@/services/authService';
import { createUserDocument, getUserScores, updateUserScores } from '@/services/firestoreService';
import { useAppStore } from '@/store/useAppStore';
import { MRT } from '@/utils/scoreCalculator';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// 이미지 URL 생성 함수 (카드 인덱스 기반)
const getImageUrl = (index: number) => {
  return `https://picsum.photos/1080/1920?random=${index}`;
};

export default function HomeScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const preloadedImagesRef = useRef<Set<number>>(new Set());

  const {
    poems,
    currentCardIndex,
    responseCount,
    userId,
    mbtiTotal,
    bigFiveCumulative,
    lastUpdated,
    loadPoems,
    swipeCard,
    setUserId,
    loadUserScores,
    getCurrentCard,
    getAnalysisResult,
    shufflePoems,
  } = useAppStore();

  // 초기화
  useEffect(() => {
    initializeApp();
  }, []);

  // 점수 변경 시 Firestore에 저장
  useEffect(() => {
    if (userId && responseCount > 0 && lastUpdated) {
      saveScoresToFirestore();
    }
  }, [responseCount, mbtiTotal, bigFiveCumulative]);

  // 이미지 프리로딩 함수
  const preloadImages = async (startIndex: number, count: number = 3) => {
    for (let i = 1; i <= count; i++) {
      const targetIndex = startIndex + i;
      // poems 배열 범위를 벗어나지 않고, 아직 프리로드하지 않은 이미지만 로드
      if (targetIndex < poems.length && !preloadedImagesRef.current.has(targetIndex)) {
        try {
          const imageUrl = getImageUrl(targetIndex);
          await Image.prefetch(imageUrl);
          preloadedImagesRef.current.add(targetIndex);
          if (__DEV__) {
            console.log(`Preloaded image for index ${targetIndex}`);
          }
        } catch (error) {
          console.warn(`Failed to preload image for index ${targetIndex}:`, error);
        }
      }
    }
  };

  // currentCardIndex 변경 시 다음 이미지들 프리로드
  useEffect(() => {
    if (poems.length > 0 && currentCardIndex >= 0) {
      preloadImages(currentCardIndex, 3);
    }
  }, [currentCardIndex, poems.length]);

  const initializeApp = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 1. Firebase 인증
      let user;
      try {
        user = await authenticateUser();
        setUserId(user.uid);
      } catch (authError: any) {
        console.error('Firebase Auth error:', authError);
        // Auth 실패 시 임시 사용자 ID 생성 (로컬 테스트용)
        const tempUserId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        setUserId(tempUserId);
        console.warn('Using temporary user ID for local testing:', tempUserId);
        // Auth 없이도 앱 사용 가능하도록 계속 진행
      }

      // 2. 시 카드 로드
      const loadedPoems = await loadPoemsFromJSON();
      loadPoems(loadedPoems);
      shufflePoems();

      // 3. 기존 점수 불러오기 (Auth가 성공한 경우에만)
      if (user) {
        try {
          const existingScores = await getUserScores(user.uid);
          if (existingScores) {
            loadUserScores(existingScores);
          } else {
            // 초기 문서 생성
            await createUserDocument(user.uid);
          }
        } catch (firestoreError) {
          console.warn('Firestore error (continuing without sync):', firestoreError);
          // Firestore 실패해도 로컬에서 계속 사용 가능
        }
      }

      setIsLoading(false);
    } catch (err: any) {
      console.error('Initialization error:', err);
      const errorMessage = err?.message || '앱 초기화 중 오류가 발생했습니다.';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const saveScoresToFirestore = async () => {
    if (!userId) return;

    try {
      await updateUserScores(userId, {
        MBTI_Total: mbtiTotal,
        BigFive_Cumulative: bigFiveCumulative,
        Response_Count: responseCount,
        Last_Updated: lastUpdated || new Date(),
      });
    } catch (err) {
      console.error('Error saving scores:', err);
    }
  };

  const handleSwipe = (direction: 'right' | 'left') => {
    // 햅틱 피드백
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    swipeCard(direction);
  };

  const handleViewResults = () => {
    const result = getAnalysisResult();
    if (result.canShowResults) {
      router.push('/results');
    } else {
      // MRT 미달 시 알림
      alert(`결과를 보려면 최소 ${MRT - responseCount}번 더 스와이프해주세요.`);
    }
  };

  const currentCard = getCurrentCard();
  const result = getAnalysisResult();
  const hasMoreCards = currentCardIndex < poems.length - 1;

  // 디버깅: 현재 상태 로그
  React.useEffect(() => {
    if (__DEV__) {
      console.log('Card state updated:', {
        currentCardIndex,
        hasMoreCards,
        totalPoems: poems.length,
        currentCardId: currentCard?.Poem_ID,
        nextCardId: poems[currentCardIndex + 1]?.Poem_ID,
      });
    }
  }, [currentCardIndex, poems.length, currentCard]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.loadingText}>로딩 중...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={initializeApp}>
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!currentCard) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>모든 시 카드를 확인했습니다.</Text>
        <TouchableOpacity
          style={styles.restartButton}
          onPress={() => {
            shufflePoems();
          }}>
          <Text style={styles.restartButtonText}>다시 시작</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 현재 카드 인덱스 기반 안정적인 이미지 URL
  const currentImageUrl = getImageUrl(currentCardIndex);

  return (
    <ImageBackground
      source={{ uri: currentImageUrl }}
      style={styles.container}
      resizeMode="cover">
      <View style={styles.overlay} />
      <BlurView intensity={20} style={styles.blurOverlay}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {/* <Text style={styles.appTitle}>Kokoro</Text> */}
            <Text style={styles.responseCount}>
              {responseCount > 20 ? responseCount : responseCount + '/20'} 회
              </Text>
          </View>
          <View style={styles.headerRight}>

            <TouchableOpacity
              style={[styles.resultButton, !result.canShowResults && styles.resultButtonDisabled]}
              onPress={handleViewResults}
              disabled={!result.canShowResults}>
              <Text style={styles.resultButtonText}>결과</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Card Stack */}
        <View style={styles.cardStack}>
          {/* 현재 카드 */}
          {currentCard && (
            <SwipeablePoemCard
              key={`current-${currentCardIndex}`}
              card={currentCard}
              index={currentCardIndex}
              onSwipe={handleSwipe}
              isActive={true}
            />
          )}
        </View>
      </BlurView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.0)',
  },
  blurOverlay: {
    flex: 1,
    // backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FFFFFF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
  },
  restartButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  restartButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  responseCount: {
    fontSize: 14,
    color: '#ffffff',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userId: {
    fontSize: 12,
    color: '#CCCCCC',
    maxWidth: 80,
  },
  resultButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  resultButtonDisabled: {
    backgroundColor: '#000',
    opacity: 0.5,
  },
  resultButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  cardStack: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    position: 'relative',
  },
  nextCardContainer: {
    position: 'absolute',
    transform: [{ scale: 0.95 }],
    opacity: 0.8,
    zIndex: 0,
  },
});
