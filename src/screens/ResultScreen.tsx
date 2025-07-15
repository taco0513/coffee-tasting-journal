import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTastingStore } from '../stores/tastingStore';
import { calculateMatchScore } from '../utils/matching';

const ResultScreen = () => {
  const navigation = useNavigation();
  const {
    currentTasting,
    selectedFlavors,
    sensoryAttributes,
    roasterNotes,
    reset,
    saveTasting,
    currentMatchScore,
  } = useTastingStore();

  const [matchScore, setMatchScore] = useState({ total: 0, flavorScore: 0, sensoryScore: 0 });
  const [scaleAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Save tasting and get match score
    const tastingRecord = saveTasting();
    setMatchScore(tastingRecord.matchScore);

    // Start animations
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Celebration animation for high scores
    if (tastingRecord.matchScore.total > 80) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
        { iterations: 3 }
      ).start();
    }
  }, []);


  const handleNewTasting = () => {
    reset();
    navigation.navigate('Home' as never);
  };

  const handleGoHome = () => {
    navigation.navigate('Home' as never);
  };

  // Get all selected flavors for display
  const allSelectedFlavors = [
    ...selectedFlavors.level1,
    ...selectedFlavors.level2,
    ...selectedFlavors.level3,
    ...selectedFlavors.level4,
  ];

  // Simple radar chart representation using bars
  const renderSensoryChart = () => {
    const attributes = [
      { label: '바디감', value: sensoryAttributes.body },
      { label: '산미', value: sensoryAttributes.acidity },
      { label: '단맛', value: sensoryAttributes.sweetness },
      { label: '여운', value: sensoryAttributes.finish },
    ];

    return (
      <View style={styles.chartContainer}>
        {attributes.map((attr) => (
          <View key={attr.label} style={styles.chartRow}>
            <Text style={styles.chartLabel}>{attr.label}</Text>
            <View style={styles.chartBarContainer}>
              <View
                style={[
                  styles.chartBar,
                  { width: `${(attr.value / 5) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.chartValue}>{attr.value}</Text>
          </View>
        ))}
        <View style={styles.mouthfeelRow}>
          <Text style={styles.chartLabel}>입안 느낌</Text>
          <Text style={styles.mouthfeelValue}>{sensoryAttributes.mouthfeel}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Match Score */}
        <Animated.View
          style={[
            styles.scoreContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={styles.scoreText}>{matchScore.total}%</Text>
          <Text style={styles.matchText}>일치!</Text>
          {matchScore.total > 80 && (
            <Text style={styles.celebrationEmoji}>🎉</Text>
          )}
        </Animated.View>

        {/* Coffee Info */}
        <View style={styles.infoSection}>
          <Text style={styles.coffeeName}>{currentTasting.coffeeName}</Text>
          <Text style={styles.roastery}>{currentTasting.roastery}</Text>
        </View>

        {/* Roaster Notes vs Your Tasting */}
        <View style={styles.comparisonSection}>
          <View style={styles.comparisonColumn}>
            <Text style={styles.columnTitle}>로스터 노트</Text>
            <Text style={styles.notesText}>
              {roasterNotes || '로스터 노트가 없습니다'}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.comparisonColumn}>
            <Text style={styles.columnTitle}>당신의 테이스팅</Text>
            <Text style={styles.notesText}>
              {allSelectedFlavors.join(', ') || '선택된 플레이버가 없습니다'}
            </Text>
          </View>
        </View>

        {/* Sensory Attributes Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>감각 평가</Text>
          {renderSensoryChart()}
        </View>

        {/* Save Status */}
        <View style={styles.saveStatus}>
          <Text style={styles.saveText}>기록이 저장되었습니다 ✓</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleNewTasting}
          >
            <Text style={styles.primaryButtonText}>새 테이스팅</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleGoHome}
          >
            <Text style={styles.secondaryButtonText}>홈으로</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  scoreContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  scoreText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  matchText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginTop: -10,
  },
  celebrationEmoji: {
    fontSize: 48,
    position: 'absolute',
    top: -20,
    right: -30,
  },
  infoSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  coffeeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  roastery: {
    fontSize: 18,
    color: '#666',
  },
  comparisonSection: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  comparisonColumn: {
    flex: 1,
  },
  columnTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  divider: {
    width: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 16,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  chartContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 20,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  chartLabel: {
    width: 80,
    fontSize: 14,
    color: '#666',
  },
  chartBarContainer: {
    flex: 1,
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  chartBar: {
    height: '100%',
    backgroundColor: '#8B4513',
    borderRadius: 10,
  },
  chartValue: {
    width: 20,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'right',
  },
  mouthfeelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  mouthfeelValue: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
    textAlign: 'right',
  },
  saveStatus: {
    alignItems: 'center',
    marginBottom: 30,
  },
  saveText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '500',
  },
  buttonContainer: {
    marginBottom: 40,
    gap: 12,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#8B4513',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#8B4513',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#8B4513',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ResultScreen;