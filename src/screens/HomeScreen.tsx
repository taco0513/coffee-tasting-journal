import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../types/navigation';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useTastingStore } from '../stores/tastingStore';
import { ITastingRecord } from '../services/realm/schemas';

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { 
    recentTastings, 
    isLoading, 
    error, 
    initializeRealm, 
    loadRecentTastings,
    clearAllTastings 
  } = useTastingStore();
  
  const [refreshing, setRefreshing] = React.useState(false);
  const [initialized, setInitialized] = React.useState(false);

  // Initialize Realm and load data on app start
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initializeRealm();
        await loadRecentTastings();
        setInitialized(true);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setInitialized(true); // Still set to true to show error state
      }
    };
    
    initializeApp();
  }, []);

  // Pull to refresh
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await loadRecentTastings();
    } catch (error) {
      console.error('Failed to refresh:', error);
    }
    setRefreshing(false);
  }, []);

  // Format date to show relative time
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return '오늘';
    } else if (diffDays === 1) {
      return '어제';
    } else if (diffDays < 7) {
      return `${diffDays}일 전`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks}주 전`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months}개월 전`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years}년 전`;
    }
  };

  // Development helper: Clear all tastings
  const handleClearAll = () => {
    Alert.alert(
      '모든 기록 삭제',
      '모든 테이스팅 기록을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllTastings();
              Alert.alert('삭제 완료', '모든 기록이 삭제되었습니다.');
            } catch (error) {
              Alert.alert('삭제 실패', '기록 삭제 중 오류가 발생했습니다.');
            }
          },
        },
      ]
    );
  };

  // Show loading screen while initializing
  if (!initialized || (isLoading && recentTastings.length === 0)) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B4513" />
          <Text style={styles.loadingText}>로딩 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error if there's one
  if (error && recentTastings.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>데이터를 불러올 수 없습니다</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadRecentTastings()}>
            <Text style={styles.retryText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#8B4513"
          />
        }
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.greeting}>안녕하세요! ☕</Text>
          <Text style={styles.date}>{new Date().toLocaleDateString('ko-KR')}</Text>
        </View>

        {/* 새 테이스팅 버튼 */}
        <TouchableOpacity 
            style={styles.newTastingButton}
            onPress={() => navigation.navigate('CoffeeInfo')}>
          <Text style={styles.plusIcon}>+</Text>
          <Text style={styles.buttonText}>새 테이스팅 시작</Text>
        </TouchableOpacity>

        {/* 개발용 임시 삭제 버튼 */}
        {__DEV__ && (
          <TouchableOpacity 
            style={styles.clearAllButton}
            onPress={handleClearAll}>
            <Text style={styles.clearAllButtonText}>🗑️ 모든 기록 삭제 (개발용)</Text>
          </TouchableOpacity>
        )}

        {/* 최근 기록 */}
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>최근 테이스팅</Text>
          
          {recentTastings.length > 0 ? (
            recentTastings.map((tasting) => (
              <TouchableOpacity 
                key={tasting.id} 
                style={styles.tastingCard}
                onPress={() => {
                  // TODO: Navigate to detail view
                  console.log('Tasting detail:', tasting.id);
                }}
              >
                <View style={styles.cardLeft}>
                  <Text style={styles.coffeeName}>{tasting.coffeeName}</Text>
                  <Text style={styles.roasteryName}>{tasting.roastery}</Text>
                  <Text style={styles.tastingDate}>{formatDate(tasting.createdAt)}</Text>
                </View>
                <View style={styles.cardRight}>
                  <Text style={[
                    styles.score,
                    tasting.matchScoreTotal >= 80 && styles.highScore
                  ]}>
                    {tasting.matchScoreTotal}%
                  </Text>
                  <Text style={styles.scoreLabel}>매칭</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>☕</Text>
              <Text style={styles.emptyText}>
                첫 테이스팅을 시작해보세요!
              </Text>
              <Text style={styles.emptySubtext}>
                위의 버튼을 눌러 새로운 커피를 기록하세요
              </Text>
            </View>
          )}
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
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  date: {
    fontSize: 14,
    color: '#666666',
    marginTop: 5,
  },
  newTastingButton: {
    backgroundColor: '#000000',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  plusIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    marginRight: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  clearAllButton: {
    backgroundColor: '#FF4444',
    marginHorizontal: 20,
    marginTop: 10,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearAllButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  recentSection: {
    padding: 20,
    paddingTop: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 15,
  },
  tastingCard: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLeft: {
    flex: 1,
  },
  coffeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  roasteryName: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666666',
    marginBottom: 4,
  },
  tastingDate: {
    fontSize: 12,
    color: '#999999',
  },
  cardRight: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
  },
  score: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
  },
  highScore: {
    color: '#8B4513',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#8B4513',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;