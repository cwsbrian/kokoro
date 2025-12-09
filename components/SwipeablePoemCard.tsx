import type { PoemCard as PoemCardType, SwipeDirection } from '@/types';
import { BlurView } from 'expo-blur';
import React, { useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;
const ROTATION_MAX = 10;

interface SwipeablePoemCardProps {
  card: PoemCardType;
  index: number;
  onSwipe: (direction: SwipeDirection) => void;
  isActive: boolean;
}

export const SwipeablePoemCard: React.FC<SwipeablePoemCardProps> = ({
  card,
  index,
  onSwipe,
  isActive,
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(isActive ? 1 : 0.95);
  const opacity = useSharedValue(isActive ? 1 : 0.8);
  const [feedbackText, setFeedbackText] = useState<'공감' | '비공감' | ''>('');
  const [feedbackColor, setFeedbackColor] = useState('#4CAF50');

  const panGesture = Gesture.Pan()
    .enabled(isActive)
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      const absX = Math.abs(event.translationX);
      const absY = Math.abs(event.translationY);

      if (absX > SWIPE_THRESHOLD || absY > SWIPE_THRESHOLD) {
        const direction: SwipeDirection = event.translationX > 0 ? 'right' : 'left';
        
        // 즉시 콜백 호출 (상태 업데이트는 지연 없이 실행)
        runOnJS(onSwipe)(direction);
        
        // 카드를 화면 밖으로 이동 (애니메이션은 백그라운드에서 실행)
        const finalX = event.translationX > 0 ? SCREEN_WIDTH + 100 : -SCREEN_WIDTH - 100;
        translateX.value = withSpring(finalX, { damping: 15 });
        translateY.value = withSpring(event.translationY * 2, { damping: 15 });
        opacity.value = withTiming(0, { duration: 200 });
      } else {
        // 원래 위치로 복귀
        translateX.value = withSpring(0, { damping: 15 });
        translateY.value = withSpring(0, { damping: 15 });
      }
    });

  const cardStyle = useAnimatedStyle(() => {
    const rotation = interpolate(
      translateX.value,
      [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      [-ROTATION_MAX, 0, ROTATION_MAX]
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotation}deg` },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    };
  });

  const feedbackOpacity = useDerivedValue(() => {
    return Math.abs(translateX.value) > 50 ? Math.min(Math.abs(translateX.value) / 100, 1) : 0;
  });

  const feedbackTextStyle = useAnimatedStyle(() => {
    const opacity = feedbackOpacity.value;
    return {
      opacity,
    };
  });

  // 피드백 텍스트 업데이트
  useAnimatedReaction(
    () => translateX.value,
    (value) => {
      if (Math.abs(value) > 50) {
        runOnJS(setFeedbackText)(value > 0 ? '공감' : '비공감');
        runOnJS(setFeedbackColor)(value > 0 ? '#4CAF50' : '#F44336');
      } else {
        runOnJS(setFeedbackText)('');
      }
    }
  );

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.cardContainer, cardStyle]}>
        <BlurView intensity={80} tint="dark" style={styles.card}>
          <Animated.View style={[styles.feedbackContainer, feedbackTextStyle]}>
            {feedbackText !== '' && (
              <Text style={[styles.feedbackText, { color: feedbackColor }]}>
                {feedbackText}
              </Text>
            )}
          </Animated.View>
          <Text style={styles.poemText}>{card.Poem_Text_KR}</Text>
          <View style={styles.tagContainer}>
            <Text style={styles.tagText}>{card.Kisho_Tag}</Text>
          </View>
        </BlurView>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    position: 'absolute',
    width: '90%',
    maxWidth: 400,
    alignSelf: 'center',
    zIndex: 1,
  },
  card: {
    width: '100%',
    aspectRatio: 0.7,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 24,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  feedbackContainer: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  feedbackText: {
    fontSize: 32,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  poemText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 36,
    textAlign: 'center',
    flex: 1,
    textAlignVertical: 'center',
  },
  poemTextJP: {
    fontSize: 18,
    fontWeight: '400',
    color: '#666666',
    lineHeight: 28,
    textAlign: 'center',
    marginTop: 12,
  },
  tagContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  tagText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

