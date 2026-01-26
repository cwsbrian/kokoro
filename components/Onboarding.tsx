import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingSlide {
  title: string;
  description: string;
  icon?: string;
}

const slides: OnboardingSlide[] = [
  {
    title: '나를 알아가는 여정',
    description:
      '시 카드를 통해 끊임없이 던져지는 철학적 질문들. 공감하거나 비공감하는 순간, 당신의 생각을 재점검하고 자신에 대해 더 깊이 알아가는 여정이 시작됩니다. 단순한 성향 테스트가 아닌, 나 자신을 탐구하는 성찰의 시간을 경험해보세요.',
  },
  {
    title: '기승형으로 표현되는 나의 성향',
    description:
      '철학적 질문에 대한 당신의 반응들이 모여 기승형(Kishō Type) 태그로 표현되는 독특한 성향을 만들어냅니다. 나만의 기승형을 확인하고 더 깊이 있는 자기 이해를 경험해보세요.',
  },
  {
    title: '지금 시작해보세요',
    description:
      '로그인하고 나만의 자기 탐구 여정을 시작하세요. 시간이 지나면서 변화하는 당신의 생각과 성향을 추적할 수 있습니다.',
  },
];

interface OnboardingProps {
  onComplete: () => void;
  onSkip?: () => void;
}

export function Onboarding({ onComplete, onSkip }: OnboardingProps) {
  const colorScheme = useColorScheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  const goToNext = () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      scrollViewRef.current?.scrollTo({
        x: nextIndex * SCREEN_WIDTH,
        animated: true,
      });
      setCurrentIndex(nextIndex);
    } else {
      onComplete();
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      scrollViewRef.current?.scrollTo({
        x: prevIndex * SCREEN_WIDTH,
        animated: true,
      });
      setCurrentIndex(prevIndex);
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      onComplete();
    }
  };

  const isDark = colorScheme === 'dark';
  const backgroundColor = isDark ? Colors.dark.background : Colors.light.background;
  const textColor = isDark ? Colors.dark.text : Colors.light.text;
  const tintColor = isDark ? Colors.dark.tint : Colors.light.tint;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Skip 버튼 */}
      {onSkip && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={[styles.skipText, { color: textColor }]}>건너뛰기</Text>
        </TouchableOpacity>
      )}

      {/* 슬라이드 */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {slides.map((slide, index) => (
          <View key={index} style={[styles.slide, { width: SCREEN_WIDTH }]}>
            <View style={styles.slideContent}>
              <Text style={[styles.title, { color: textColor }]}>{slide.title}</Text>
              <Text style={[styles.description, { color: textColor }]}>
                {slide.description}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* 페이지 인디케이터 */}
      <View style={styles.indicatorContainer}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              {
                backgroundColor: index === currentIndex ? tintColor : '#CCCCCC',
                width: index === currentIndex ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>

      {/* 네비게이션 버튼 */}
      <View style={styles.buttonContainer}>
        {currentIndex > 0 && (
          <TouchableOpacity
            style={[styles.navButton, styles.prevButton]}
            onPress={goToPrevious}
          >
            <Text style={[styles.navButtonText, { color: textColor }]}>이전</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.navButton, styles.nextButton, { backgroundColor: tintColor }]}
          onPress={goToNext}
        >
          <Text style={[styles.navButtonText, styles.nextButtonText]}>
            {currentIndex === slides.length - 1 ? '시작하기' : '다음'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  skipText: {
    fontSize: 16,
    opacity: 0.7,
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  slideContent: {
    alignItems: 'center',
    maxWidth: 320,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 36,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.8,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 24,
  },
  indicator: {
    height: 8,
    borderRadius: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingBottom: 40,
    gap: 12,
  },
  navButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prevButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  nextButton: {
    minWidth: 120,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  nextButtonText: {
    color: '#FFFFFF',
  },
});
