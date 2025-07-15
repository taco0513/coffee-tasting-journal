import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect, CommonActions } from '@react-navigation/native';
import { useTastingStore } from '../stores/tastingStore';
import { calculateMatchScore, getMatchDetails } from '../utils/matching';
import { ITastingRecord } from '../services/realm/schemas';
import { realmService } from '../services/realm';

const ResultScreen = () => {
  const navigation = useNavigation();
  const {
    currentTasting,
    selectedFlavors,
    sensoryAttributes,
    roasterNotes,
    reset,
    completeTasting,
    currentMatchScore,
    loadRecentTastings,
  } = useTastingStore();

  const [matchScore, setMatchScore] = useState({ total: 0, flavorScore: 0, sensoryScore: 0 });
  const [scaleAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(0));
  const [savedRecord, setSavedRecord] = useState<ITastingRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [matchDetails, setMatchDetails] = useState<ReturnType<typeof getMatchDetails> | null>(null);

  useEffect(() => {
    // Calculate and save tasting
    const saveTasting = async () => {
      try {
        setIsLoading(true);
        
        // Calculate match score first for display
        const score = calculateMatchScore(roasterNotes, selectedFlavors, sensoryAttributes);
        setMatchScore(score);
        
        // Get match details for comparison display
        const details = getMatchDetails(roasterNotes, selectedFlavors, sensoryAttributes);
        setMatchDetails(details);
        
        // Save to Realm
        const result = await completeTasting();
        if (!result.success) {
          Alert.alert(
            '저장 실패',
            result.error || '테이스팅 기록을 저장하는데 실패했습니다.',
            [{ text: '확인' }]
          );
          setIsLoading(false);
          return;
        }
        
        // Save the record for display
        if (result.record) {
          setSavedRecord(result.record);
        }
        
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
        if (score.total > 80) {
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
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error in saveTasting:', error);
        Alert.alert(
          '오류 발생',
          '예기치 않은 오류가 발생했습니다.',
          [{ text: '확인' }]
        );
        setIsLoading(false);
      }
    };
    
    saveTasting();
  }, []);


  const handleNewTasting = () => {
    reset();
    navigation.navigate('Home' as never);
  };

  const handleGoHome = async () => {
    // Reload recent tastings before navigating
    await loadRecentTastings();
    
    // Reset navigation stack to Home
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      })
    );
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

  // Show loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B4513" />
          <Text style={styles.loadingText}>저장 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Calculate actual scores from saved record or current state
  const displayScore = savedRecord 
    ? {
        total: savedRecord.matchScoreTotal,
        flavorScore: savedRecord.matchScoreFlavor,
        sensoryScore: savedRecord.matchScoreSensory,
      }
    : matchScore;

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
          <Text style={styles.scoreText}>{displayScore.total}%</Text>
          <Text style={styles.matchText}>일치!</Text>
          {displayScore.total > 80 && (
            <Text style={styles.celebrationEmoji}>🎉</Text>
          )}
        </Animated.View>

        {/* Coffee Info */}
        <View style={styles.infoSection}>
          <Text style={styles.coffeeName}>{currentTasting.coffeeName}</Text>
          <Text style={styles.roastery}>{currentTasting.roastery}</Text>
        </View>

        {/* Match Score Details */}
        <View style={styles.scoreDetailsSection}>
          <View style={styles.scoreDetailRow}>
            <Text style={styles.scoreDetailLabel}>플레이버 매칭</Text>
            <Text style={styles.scoreDetailValue}>{displayScore.flavorScore}%</Text>
          </View>
          <View style={styles.scoreDetailRow}>
            <Text style={styles.scoreDetailLabel}>감각 평가 매칭</Text>
            <Text style={styles.scoreDetailValue}>{displayScore.sensoryScore}%</Text>
          </View>
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

        {/* Match Details */}
        {matchDetails && (
          <View style={styles.matchDetailsSection}>
            {matchDetails.matchedFlavors.length > 0 && (
              <View style={styles.matchDetail}>
                <Text style={styles.matchDetailTitle}>✓ 일치한 플레이버</Text>
                <Text style={styles.matchDetailText}>
                  {matchDetails.matchedFlavors.join(', ')}
                </Text>
              </View>
            )}
            
            {matchDetails.sensoryMatches.length > 0 && (
              <View style={styles.matchDetail}>
                <Text style={styles.matchDetailTitle}>✓ 일치한 감각 특성</Text>
                <Text style={styles.matchDetailText}>
                  {matchDetails.sensoryMatches.join(', ')}
                </Text>
              </View>
            )}
            
            {matchDetails.suggestions.length > 0 && (
              <View style={styles.matchDetail}>
                <Text style={styles.matchDetailTitle}>💡 추천 플레이버</Text>
                <Text style={styles.matchDetailText}>
                  다음에는 이런 플레이버도 찾아보세요: {matchDetails.suggestions.join(', ')}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Sensory Attributes Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>감각 평가</Text>
          {renderSensoryChart()}
        </View>

        {/* Save Status */}
        <View style={styles.saveStatus}>
          <Text style={styles.saveText}>기록이 저장되었습니다 ✓</Text>
          {savedRecord && (
            <Text style={styles.saveDate}>
              {new Date(savedRecord.createdAt).toLocaleString('ko-KR')}
            </Text>
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  scoreDetailsSection: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  scoreDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  scoreDetailLabel: {
    fontSize: 14,
    color: '#666',
  },
  scoreDetailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
  },
  matchDetailsSection: {
    marginBottom: 30,
  },
  matchDetail: {
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  matchDetailTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  matchDetailText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  saveDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});

export default ResultScreen;