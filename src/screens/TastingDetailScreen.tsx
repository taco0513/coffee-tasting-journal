import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { ITastingRecord } from '../services/realm/schemas';
import RealmService from '../services/realm/RealmService';
import { useToastStore } from '../stores/toastStore';
import {
  HIGColors,
} from '../styles/common';
import { NavigationButton } from '../components/common';
import { Colors } from '../constants/colors';

// Navigation types
type TastingDetailScreenRouteProp = RouteProp<RootStackParamList, 'TastingDetail'>;
type TastingDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'TastingDetail'>;

const TastingDetailScreen = () => {
  const navigation = useNavigation<TastingDetailScreenNavigationProp>();
  const route = useRoute<TastingDetailScreenRouteProp>();
  const { showSuccessToast, showErrorToast } = useToastStore();
  
  const [tastingRecord, setTastingRecord] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const realmService = RealmService.getInstance();
  const isMountedRef = useRef(true);

  // Get tastingId from route params
  const tastingId = route.params?.tastingId;

  useEffect(() => {
    loadTastingData();
  }, [tastingId]);

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadTastingData = async () => {
    try {
      if (!isMountedRef.current) return;
      
      setLoading(true);
      setError(null);
      
      if (!tastingId) {
        if (isMountedRef.current) {
          setError('테이스팅 ID가 없습니다.');
        }
        return;
      }

      const record = realmService.getTastingRecordById(tastingId);
      
      if (!record) {
        if (isMountedRef.current) {
          setError('테이스팅 기록을 찾을 수 없습니다.');
        }
        return;
      }

      if (isMountedRef.current) {
        // Realm 객체를 plain object로 복사하여 저장
        const plainRecord = {
          id: record.id,
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
          cafeName: record.cafeName,
          roastery: record.roastery,
          coffeeName: record.coffeeName,
          origin: record.origin,
          variety: record.variety,
          altitude: record.altitude,
          process: record.process,
          temperature: record.temperature,
          roasterNotes: record.roasterNotes,
          matchScoreTotal: record.matchScoreTotal,
          matchScoreFlavor: record.matchScoreFlavor,
          matchScoreSensory: record.matchScoreSensory,
          flavorNotes: record.flavorNotes ? Array.from(record.flavorNotes).map(note => ({
            level: note.level,
            value: note.value,
            koreanValue: note.koreanValue,
          })) : [],
          sensoryAttribute: record.sensoryAttribute ? {
            body: record.sensoryAttribute.body,
            acidity: record.sensoryAttribute.acidity,
            sweetness: record.sensoryAttribute.sweetness,
            finish: record.sensoryAttribute.finish,
            mouthfeel: record.sensoryAttribute.mouthfeel,
          } : null,
        };
        setTastingRecord(plainRecord);
      }
    } catch (err) {
      console.error('Failed to load tasting data:', err);
      if (isMountedRef.current) {
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const handleEdit = () => {
    // TODO: Navigate to edit screen
    Alert.alert('수정', '수정 기능은 아직 구현되지 않았습니다.');
  };

  const handleDelete = () => {
    if (!tastingId) {
      showErrorToast('삭제 실패', '테이스팅 ID가 없습니다');
      return;
    }

    if (isDeleting) {
      return; // 이미 삭제 중이면 중복 실행 방지
    }

    Alert.alert(
      '삭제 확인',
      '정말 이 테이스팅 기록을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '삭제', 
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeleting(true);
              
              // 삭제 실행
              const success = await RealmService.deleteTasting(tastingId);
              
              if (success) {
                showSuccessToast('삭제 완료', '테이스팅 기록이 삭제되었습니다');
                // 삭제 성공 후 즉시 화면 이동
                navigation.goBack();
              } else {
                showErrorToast('삭제 실패', '다시 시도해주세요');
                setIsDeleting(false);
              }
              
            } catch (error) {
              showErrorToast('삭제 실패', '다시 시도해주세요');
              console.error('Delete error:', error);
              setIsDeleting(false);
            }
          }
        }
      ]
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMouthfeelKorean = (mouthfeel: string) => {
    const mapping: { [key: string]: string } = {
      'Clean': '깔끔한',
      'Creamy': '크리미한',
      'Juicy': '쥬시한',
      'Silky': '실키한'
    };
    return mapping[mouthfeel] || mouthfeel;
  };

  // Loading state
  if (loading || isDeleting) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000000" />
          <Text style={styles.loadingText}>
            {isDeleting ? '삭제 중...' : '로딩 중...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error || !tastingRecord) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || '데이터를 불러올 수 없습니다.'}</Text>
          <NavigationButton
            title="다시 시도"
            onPress={loadTastingData}
            variant="primary"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Edit/Delete buttons */}
      <View style={styles.header}>
        <NavigationButton
          title="← 뒤로"
          onPress={() => navigation.goBack()}
          variant="text"
          fullWidth={false}
          style={styles.backButton}
          textStyle={styles.backButtonText}
        />
        <View style={styles.headerButtons}>
          <NavigationButton
            title="수정"
            onPress={handleEdit}
            variant="primary"
            fullWidth={false}
            style={styles.editButton}
          />
          <NavigationButton
            title="삭제"
            onPress={handleDelete}
            variant="secondary"
            fullWidth={false}
            disabled={isDeleting}
            style={{ backgroundColor: HIGColors.red }}
            textStyle={{ color: '#FFFFFF' }}
          />
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Coffee Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>커피 정보</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>커피 이름</Text>
              <Text style={styles.infoValue}>{tastingRecord.coffeeName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>로스터리</Text>
              <Text style={styles.infoValue}>{tastingRecord.roastery}</Text>
            </View>
            {tastingRecord.cafeName && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>카페</Text>
                <Text style={styles.infoValue}>{tastingRecord.cafeName}</Text>
              </View>
            )}
            {tastingRecord.origin && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>원산지</Text>
                <Text style={styles.infoValue}>{tastingRecord.origin}</Text>
              </View>
            )}
            {tastingRecord.variety && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>품종</Text>
                <Text style={styles.infoValue}>{tastingRecord.variety}</Text>
              </View>
            )}
            {tastingRecord.altitude && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>고도</Text>
                <Text style={styles.infoValue}>{tastingRecord.altitude}</Text>
              </View>
            )}
            {tastingRecord.process && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>가공방식</Text>
                <Text style={styles.infoValue}>{tastingRecord.process}</Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>온도</Text>
              <Text style={styles.infoValue}>{tastingRecord.temperature === 'hot' ? '☕ Hot' : '🧊 Ice'}</Text>
            </View>
          </View>
        </View>

        {/* Roaster Notes Section */}
        {tastingRecord.roasterNotes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>로스터 노트</Text>
            <View style={styles.card}>
              <Text style={styles.notesText}>{tastingRecord.roasterNotes}</Text>
            </View>
          </View>
        )}

        {/* Flavor Notes Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>선택한 맛</Text>
          <View style={styles.card}>
            {[1, 2, 3, 4].map(level => {
              const flavorsAtLevel = tastingRecord.flavorNotes.filter(note => note.level === level);
              if (flavorsAtLevel.length === 0) return null;
              
              return (
                <View key={level} style={styles.flavorLevel}>
                  <Text style={styles.flavorLevelTitle}>Level {level}</Text>
                  <View style={styles.flavorTags}>
                    {flavorsAtLevel.map((note, index) => (
                      <View key={index} style={styles.flavorTag}>
                        <Text style={styles.flavorTagText}>{note.value}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Sensory Evaluation Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>감각 평가</Text>
          <View style={styles.card}>
            <View style={styles.sensoryRow}>
              <Text style={styles.sensoryLabel}>바디감</Text>
              <View style={styles.sensoryBar}>
                <View style={[styles.sensoryFill, { width: `${tastingRecord.sensoryAttribute.body * 20}%` }]} />
              </View>
              <Text style={styles.sensoryValue}>{tastingRecord.sensoryAttribute.body}/5</Text>
            </View>
            <View style={styles.sensoryRow}>
              <Text style={styles.sensoryLabel}>산미</Text>
              <View style={styles.sensoryBar}>
                <View style={[styles.sensoryFill, { width: `${tastingRecord.sensoryAttribute.acidity * 20}%` }]} />
              </View>
              <Text style={styles.sensoryValue}>{tastingRecord.sensoryAttribute.acidity}/5</Text>
            </View>
            <View style={styles.sensoryRow}>
              <Text style={styles.sensoryLabel}>단맛</Text>
              <View style={styles.sensoryBar}>
                <View style={[styles.sensoryFill, { width: `${tastingRecord.sensoryAttribute.sweetness * 20}%` }]} />
              </View>
              <Text style={styles.sensoryValue}>{tastingRecord.sensoryAttribute.sweetness}/5</Text>
            </View>
            <View style={styles.sensoryRow}>
              <Text style={styles.sensoryLabel}>여운</Text>
              <View style={styles.sensoryBar}>
                <View style={[styles.sensoryFill, { width: `${tastingRecord.sensoryAttribute.finish * 20}%` }]} />
              </View>
              <Text style={styles.sensoryValue}>{tastingRecord.sensoryAttribute.finish}/5</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>질감</Text>
              <Text style={styles.infoValue}>{getMouthfeelKorean(tastingRecord.sensoryAttribute.mouthfeel)}</Text>
            </View>
          </View>
        </View>

        {/* Matching Score Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>매칭 점수</Text>
          <View style={styles.card}>
            <View style={styles.scoreContainer}>
              <View style={styles.mainScore}>
                <Text style={styles.scoreValue}>{tastingRecord.matchScoreTotal}%</Text>
                <Text style={styles.scoreLabel}>전체 매칭</Text>
              </View>
              <View style={styles.subScores}>
                <View style={styles.subScore}>
                  <Text style={styles.subScoreValue}>{tastingRecord.matchScoreFlavor}%</Text>
                  <Text style={styles.subScoreLabel}>맛 매칭</Text>
                </View>
                <View style={styles.subScore}>
                  <Text style={styles.subScoreValue}>{tastingRecord.matchScoreSensory}%</Text>
                  <Text style={styles.subScoreLabel}>감각 매칭</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Date Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>기록 정보</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>기록일</Text>
              <Text style={styles.infoValue}>{formatDate(tastingRecord.createdAt)}</Text>
            </View>
            {tastingRecord.updatedAt.getTime() !== tastingRecord.createdAt.getTime() && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>수정일</Text>
                <Text style={styles.infoValue}>{formatDate(tastingRecord.updatedAt)}</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.TEXT_SECONDARY,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: Colors.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    // 공통 스타일로 대체됨
  },
  retryButtonText: {
    // 공통 스타일로 대체됨
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    backgroundColor: 'transparent',
  },
  backButtonText: {
    color: HIGColors.blue,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    // 공통 스타일로 대체됨
  },
  deleteButton: {
    // 공통 스타일로 대체됨
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  notesText: {
    fontSize: 14,
    color: '#000000',
    lineHeight: 20,
  },
  flavorLevel: {
    marginBottom: 16,
  },
  flavorLevelTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  flavorTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  flavorTag: {
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  flavorTagText: {
    fontSize: 12,
    color: '#000000',
  },
  sensoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sensoryLabel: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    width: 60,
    fontWeight: '500',
  },
  sensoryBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginHorizontal: 12,
  },
  sensoryFill: {
    height: '100%',
    backgroundColor: '#000000',
    borderRadius: 4,
  },
  sensoryValue: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '600',
    width: 40,
    textAlign: 'right',
  },
  scoreContainer: {
    alignItems: 'center',
  },
  mainScore: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#000000',
  },
  scoreLabel: {
    fontSize: 16,
    color: Colors.TEXT_SECONDARY,
    marginTop: 4,
  },
  subScores: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  subScore: {
    alignItems: 'center',
  },
  subScoreValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
  },
  subScoreLabel: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
    marginTop: 4,
  },
});

export default TastingDetailScreen;