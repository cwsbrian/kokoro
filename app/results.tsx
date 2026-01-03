import { useAppStore } from '@/store/useAppStore';
import { MRT } from '@/utils/scoreCalculator';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Line, Polygon, Text as SvgText } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_SIZE = Math.min(SCREEN_WIDTH - 40, 300);

// 기승형 타입 조합 설명 함수
function getTypeCombinationDescription(fullType: string): string {
  const [ki, sho, ten, ketsu] = fullType.split('-');
  
  const descriptions: Record<string, string> = {
    'Outer-Harmony-Feeling-Fixed': 
      '외향적이면서도 조화로운 관계를 중시하며, 감정과 가치를 바탕으로 체계적으로 행동하는 유형입니다. 타인과의 협력을 통해 목표를 달성하며, 계획적이고 안정적인 환경에서 최고의 성과를 냅니다. 팀워크와 공감 능력이 뛰어나며, 구조화된 환경에서 사람들과 함께 성장하는 것을 선호합니다.',
    
    'Outer-Harmony-Feeling-Flow':
      '외향적이고 조화로운 관계를 중시하며, 감정과 가치를 바탕으로 유연하게 행동하는 유형입니다. 타인과의 협력을 즐기며, 변화하는 상황에 쉽게 적응합니다. 새로운 경험과 가능성을 열어두고, 사람들과 함께하는 과정에서 창의력을 발휘합니다.',
    
    'Outer-Harmony-Logic-Fixed':
      '외향적이면서도 조화로운 관계를 중시하며, 논리와 객관성을 바탕으로 체계적으로 행동하는 유형입니다. 효율적인 협업과 체계적인 계획을 통해 목표를 달성하며, 구조화된 환경에서 최고의 성과를 냅니다.',
    
    'Outer-Harmony-Logic-Flow':
      '외향적이고 조화로운 관계를 중시하며, 논리와 객관성을 바탕으로 유연하게 행동하는 유형입니다. 타인과의 협력을 통해 문제를 해결하며, 변화하는 상황에 논리적으로 대응합니다.',
    
    'Outer-Solitude-Feeling-Fixed':
      '외향적이지만 독립적인 활동을 선호하며, 감정과 가치를 바탕으로 체계적으로 행동하는 유형입니다. 자신만의 방식으로 목표를 달성하며, 계획적이고 안정적인 환경에서 최고의 성과를 냅니다.',
    
    'Outer-Solitude-Feeling-Flow':
      '외향적이지만 독립적인 활동을 선호하며, 감정과 가치를 바탕으로 유연하게 행동하는 유형입니다. 새로운 경험을 추구하면서도 자신만의 가치를 중요하게 여기며, 변화하는 상황에 쉽게 적응합니다.',
    
    'Outer-Solitude-Logic-Fixed':
      '외향적이지만 독립적인 활동을 선호하며, 논리와 객관성을 바탕으로 체계적으로 행동하는 유형입니다. 효율성과 객관성을 중시하며, 구조화된 환경에서 자신만의 방식으로 목표를 달성합니다.',
    
    'Outer-Solitude-Logic-Flow':
      '외향적이지만 독립적인 활동을 선호하며, 논리와 객관성을 바탕으로 유연하게 행동하는 유형입니다. 객관적인 분석을 통해 문제를 해결하며, 변화하는 상황에 논리적으로 대응합니다.',
    
    'Inner-Harmony-Feeling-Fixed':
      '내향적이면서도 조화로운 관계를 중시하며, 감정과 가치를 바탕으로 체계적으로 행동하는 유형입니다. 깊이 있는 관계를 형성하며, 계획적이고 안정적인 환경에서 최고의 성과를 냅니다. 타인과의 조화를 중시하면서도 자신만의 공간과 시간을 필요로 합니다.',
    
    'Inner-Harmony-Feeling-Flow':
      '내향적이면서도 조화로운 관계를 중시하며, 감정과 가치를 바탕으로 유연하게 행동하는 유형입니다. 깊이 있는 관계를 형성하며, 변화하는 상황에 감정적으로 대응합니다. 타인과의 조화를 중시하면서도 유연한 환경을 선호합니다.',
    
    'Inner-Harmony-Logic-Fixed':
      '내향적이면서도 조화로운 관계를 중시하며, 논리와 객관성을 바탕으로 체계적으로 행동하는 유형입니다. 깊이 있는 사고와 체계적인 계획을 통해 목표를 달성하며, 구조화된 환경에서 최고의 성과를 냅니다.',
    
    'Inner-Harmony-Logic-Flow':
      '내향적이면서도 조화로운 관계를 중시하며, 논리와 객관성을 바탕으로 유연하게 행동하는 유형입니다. 깊이 있는 사고를 통해 문제를 해결하며, 변화하는 상황에 논리적으로 대응합니다.',
    
    'Inner-Solitude-Feeling-Fixed':
      '내향적이고 독립적인 활동을 선호하며, 감정과 가치를 바탕으로 체계적으로 행동하는 유형입니다. 자신만의 가치와 감정을 중요하게 여기며, 계획적이고 안정적인 환경에서 최고의 성과를 냅니다. 깊이 있는 사고와 내적 성찰을 통해 성장합니다.',
    
    'Inner-Solitude-Feeling-Flow':
      '내향적이고 독립적인 활동을 선호하며, 감정과 가치를 바탕으로 유연하게 행동하는 유형입니다. 자신만의 가치와 감정을 중요하게 여기며, 변화하는 상황에 감정적으로 대응합니다. 깊이 있는 사고와 내적 성찰을 통해 성장하며, 유연한 환경을 선호합니다.',
    
    'Inner-Solitude-Logic-Fixed':
      '내향적이고 독립적인 활동을 선호하며, 논리와 객관성을 바탕으로 체계적으로 행동하는 유형입니다. 깊이 있는 사고와 논리적 분석을 통해 목표를 달성하며, 구조화된 환경에서 최고의 성과를 냅니다. 독립적이고 체계적인 접근을 통해 문제를 해결합니다.',
    
    'Inner-Solitude-Logic-Flow':
      '내향적이고 독립적인 활동을 선호하며, 논리와 객관성을 바탕으로 유연하게 행동하는 유형입니다. 깊이 있는 사고와 논리적 분석을 통해 문제를 해결하며, 변화하는 상황에 논리적으로 대응합니다. 독립적이고 유연한 접근을 통해 성장합니다.',
  };
  
  return descriptions[fullType] || 
    `${ki}-${sho}-${ten}-${ketsu} 타입은 각 구성 요소의 조합으로 형성된 독특한 성향을 나타냅니다. 위의 각 축 설명을 참고하여 자신의 성향을 이해하시기 바랍니다.`;
}

export default function ResultsScreen() {
  const router = useRouter();
  const { getAnalysisResult } = useAppStore();
  const result = getAnalysisResult();

  if (!result.canShowResults) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          결과를 보려면 최소 {MRT}회 이상 스와이프해야 합니다.
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
        
        <View style={styles.kishoExplanation}>
          <Text style={styles.explanationTitle}>기승형 구성 요소</Text>
          <View style={styles.axisExplanation}>
            <Text style={styles.axisTitle}>• Ki (起): {result.kisho.Ki}</Text>
            <Text style={styles.axisDescription}>
              {result.kisho.Ki === 'Inner' 
                ? '내향적 성향으로, 내부 세계와의 깊은 연결을 중시합니다. 혼자만의 시간을 통해 에너지를 충전하며, 깊이 있는 사고와 내적 성찰을 선호합니다.'
                : '외향적 성향으로, 외부 세계와의 활발한 상호작용을 즐깁니다. 사람들과의 교류를 통해 에너지를 얻으며, 다양한 경험과 활동을 추구합니다.'}
            </Text>
          </View>
          
          <View style={styles.axisExplanation}>
            <Text style={styles.axisTitle}>• Shō (承): {result.kisho.Shō}</Text>
            <Text style={styles.axisDescription}>
              {result.kisho.Shō === 'Harmony' 
                ? '조화를 중시하는 성향으로, 타인과의 관계와 협력을 중요하게 생각합니다. 갈등을 피하고 집단의 화합을 추구하며, 공감 능력이 뛰어납니다.'
                : '고독을 선호하는 성향으로, 독립적인 활동과 개인적 공간을 중시합니다. 타인에 의존하기보다 스스로의 판단과 결정을 신뢰하며, 깊이 있는 집중을 선호합니다.'}
            </Text>
          </View>
          
          <View style={styles.axisExplanation}>
            <Text style={styles.axisTitle}>• Ten (轉): {result.kisho.Ten}</Text>
            <Text style={styles.axisDescription}>
              {result.kisho.Ten === 'Feeling' 
                ? '감정과 가치를 중시하는 성향으로, 사람 중심의 판단을 합니다. 인간관계와 감정적 만족을 중요하게 여기며, 공감과 배려를 통해 결정을 내립니다.'
                : '논리와 객관성을 중시하는 성향으로, 사실과 원칙에 기반한 판단을 합니다. 효율성과 공정성을 추구하며, 감정보다는 논리적 분석을 통해 결정을 내립니다.'}
            </Text>
          </View>
          
          <View style={styles.axisExplanation}>
            <Text style={styles.axisTitle}>• Ketsu (結): {result.kisho.Ketsu}</Text>
            <Text style={styles.axisDescription}>
              {result.kisho.Ketsu === 'Flow' 
                ? '유연하고 개방적인 성향으로, 변화와 새로운 가능성을 환영합니다. 계획보다는 상황에 맞춰 유연하게 대응하며, 자유로운 환경에서 창의력을 발휘합니다.'
                : '체계적이고 계획적인 성향으로, 구조와 질서를 중시합니다. 명확한 목표와 계획을 세우고, 체계적으로 실행하는 것을 선호하며, 안정성과 예측 가능성을 추구합니다.'}
            </Text>
          </View>
        </View>
        
        <View style={styles.typeCombination}>
          <Text style={styles.combinationTitle}>전체 타입 해석</Text>
          <Text style={styles.combinationDescription}>
            {getTypeCombinationDescription(result.kisho.fullType)}
          </Text>
        </View>
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
    marginBottom: 20,
  },
  kishoExplanation: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  axisExplanation: {
    marginBottom: 16,
  },
  axisTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 6,
  },
  axisDescription: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 20,
  },
  typeCombination: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  combinationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  combinationDescription: {
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

