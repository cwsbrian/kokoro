import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Polygon, Circle, Line, Text as SvgText } from 'react-native-svg';
import { useAppStore } from '@/store/useAppStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_SIZE = Math.min(SCREEN_WIDTH - 40, 300);

export default function ResultsScreen() {
  const router = useRouter();
  const { getAnalysisResult } = useAppStore();
  const result = getAnalysisResult();

  if (!result.canShowResults) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          결과를 보려면 최소 200회 이상 스와이프해야 합니다.
        </Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Kishō Type */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>기승형 (Kishō-type)</Text>
        <View style={styles.kishoTypeContainer}>
          <Text style={styles.kishoTypeText}>{result.kisho.fullType}</Text>
        </View>
        <View style={styles.kishoDetails}>
          <Text style={styles.kishoDetailItem}>Ki: {result.kisho.Ki}</Text>
          <Text style={styles.kishoDetailItem}>Shō: {result.kisho.Shō}</Text>
          <Text style={styles.kishoDetailItem}>Ten: {result.kisho.Ten}</Text>
          <Text style={styles.kishoDetailItem}>Ketsu: {result.kisho.Ketsu}</Text>
        </View>
      </View>

      {/* Big Five Radar Chart */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Big Five (OCEAN)</Text>
        <View style={styles.chartContainer}>
          <BigFiveRadarChart data={result.bigFive} />
        </View>
        <View style={styles.bigFiveDetails}>
          <Text style={styles.bigFiveItem}>
            Openness: {result.bigFive.O.toFixed(1)}%
          </Text>
          <Text style={styles.bigFiveItem}>
            Conscientiousness: {result.bigFive.C.toFixed(1)}%
          </Text>
          <Text style={styles.bigFiveItem}>
            Extraversion: {result.bigFive.E.toFixed(1)}%
          </Text>
          <Text style={styles.bigFiveItem}>
            Agreeableness: {result.bigFive.A.toFixed(1)}%
          </Text>
          <Text style={styles.bigFiveItem}>
            Neuroticism: {result.bigFive.N.toFixed(1)}%
          </Text>
        </View>
      </View>

      {/* MBTI Bar Chart */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>MBTI Preferences</Text>
        <Text style={styles.mbtiTypeText}>Type: {result.mbti.type}</Text>
        <View style={styles.chartContainer}>
          <MBTIBarChart preferences={result.mbti.preferences} />
        </View>
      </View>

      {/* Interpretation */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>해석</Text>
        <Text style={styles.interpretationText}>
          당신의 기승형은 {result.kisho.fullType}입니다. 이는 당신의 성향을 나타내는
          독특한 조합입니다. MBTI 타입 {result.mbti.type}과 Big Five 점수를 기반으로
          분석되었습니다.
        </Text>
      </View>

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>돌아가기</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// Big Five Radar Chart Component
function BigFiveRadarChart({ data }: { data: any }) {
  const center = CHART_SIZE / 2;
  const radius = CHART_SIZE / 2 - 40;
  const angles = [0, 72, 144, 216, 288].map((angle) => (angle * Math.PI) / 180);
  const labels = ['O', 'C', 'E', 'A', 'N'];

  // 데이터를 0-1 범위로 정규화
  const normalizedData = [
    data.O / 100,
    data.C / 100,
    data.E / 100,
    data.A / 100,
    data.N / 100,
  ];

  // 다각형 좌표 계산
  const points = angles.map((angle, index) => {
    const value = normalizedData[index];
    const r = radius * value;
    const x = center + r * Math.sin(angle);
    const y = center - r * Math.cos(angle);
    return `${x},${y}`;
  }).join(' ');

  // 그리드 라인
  const gridLines = [0.25, 0.5, 0.75, 1.0].map((scale) => {
    const gridPoints = angles.map((angle) => {
      const r = radius * scale;
      const x = center + r * Math.sin(angle);
      const y = center - r * Math.cos(angle);
      return `${x},${y}`;
    }).join(' ');
    return (
      <Polygon
        key={scale}
        points={gridPoints}
        fill="none"
        stroke="#E0E0E0"
        strokeWidth="1"
        opacity={0.5}
      />
    );
  });

  // 축 라인
  const axes = angles.map((angle, index) => {
    const x = center + radius * Math.sin(angle);
    const y = center - radius * Math.cos(angle);
    return (
      <Line
        key={index}
        x1={center}
        y1={center}
        x2={x}
        y2={y}
        stroke="#E0E0E0"
        strokeWidth="1"
        opacity={0.5}
      />
    );
  });

  // 레이블
  const labelElements = angles.map((angle, index) => {
    const labelRadius = radius + 20;
    const x = center + labelRadius * Math.sin(angle);
    const y = center - labelRadius * Math.cos(angle);
    return (
      <SvgText
        key={index}
        x={x}
        y={y}
        fontSize="14"
        fontWeight="600"
        fill="#333333"
        textAnchor="middle"
        alignmentBaseline="middle">
        {labels[index]}
      </SvgText>
    );
  });

  return (
    <Svg width={CHART_SIZE} height={CHART_SIZE}>
      {gridLines}
      {axes}
      <Polygon
        points={points}
        fill="#4CAF50"
        fillOpacity={0.3}
        stroke="#4CAF50"
        strokeWidth="2"
      />
      {labelElements}
    </Svg>
  );
}

// MBTI Bar Chart Component
function MBTIBarChart({ preferences }: { preferences: any }) {
  const pairs = [
    { left: 'E', right: 'I', leftValue: preferences.E, rightValue: preferences.I },
    { left: 'S', right: 'N', leftValue: preferences.S, rightValue: preferences.N },
    { left: 'T', right: 'F', leftValue: preferences.T, rightValue: preferences.F },
    { left: 'J', right: 'P', leftValue: preferences.J, rightValue: preferences.P },
  ];

  return (
    <View style={styles.barChartContainer}>
      {pairs.map((pair, index) => (
        <View key={index} style={styles.barPair}>
          <View style={styles.barRow}>
            <View style={styles.barLabelContainer}>
              <Text style={styles.barLabel}>{pair.left}</Text>
            </View>
            <View style={styles.barContainer}>
              <View
                style={[
                  styles.bar,
                  styles.barLeft,
                  { width: `${pair.leftValue}%` },
                ]}
              />
              <View
                style={[
                  styles.bar,
                  styles.barRight,
                  { width: `${pair.rightValue}%` },
                ]}
              />
            </View>
            <View style={styles.barLabelContainer}>
              <Text style={styles.barLabel}>{pair.right}</Text>
            </View>
          </View>
          <View style={styles.barValueRow}>
            <Text style={styles.barValue}>{pair.leftValue.toFixed(1)}%</Text>
            <Text style={styles.barValue}>{pair.rightValue.toFixed(1)}%</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  kishoTypeContainer: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  kishoTypeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  kishoDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  kishoDetailItem: {
    fontSize: 14,
    color: '#666666',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  bigFiveDetails: {
    marginTop: 16,
  },
  bigFiveItem: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 8,
  },
  mbtiTypeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 20,
  },
  barChartContainer: {
    marginTop: 16,
  },
  barPair: {
    marginBottom: 24,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  barLabelContainer: {
    width: 30,
    alignItems: 'center',
  },
  barLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  barContainer: {
    flex: 1,
    flexDirection: 'row',
    height: 30,
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: 12,
  },
  bar: {
    height: '100%',
  },
  barLeft: {
    backgroundColor: '#4CAF50',
    justifyContent: 'flex-start',
  },
  barRight: {
    backgroundColor: '#2196F3',
    justifyContent: 'flex-end',
  },
  barValueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 42,
  },
  barValue: {
    fontSize: 12,
    color: '#666666',
  },
  interpretationText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 22,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 20,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

