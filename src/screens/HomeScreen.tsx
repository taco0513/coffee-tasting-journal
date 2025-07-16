import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import RealmService from '../services/realm/RealmService';
import {useToastStore} from '../stores/toastStore';
import {
  hitSlop,
  HIGColors,
} from '../styles/common';
import { NavigationButton, Heading1, Heading2, BodyText, Caption } from '../components/common';
import { Colors } from '../constants/colors';

export default function HomeScreen({navigation}: any) {
  const [recentTastings, setRecentTastings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { showSuccessToast, showErrorToast } = useToastStore();

  const loadTastings = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Realm 초기화 확인
      try {
        await RealmService.initializeRealm();
      } catch (initError) {
        console.log('Realm already initialized or initialization failed:', initError);
      }
      
      // 주기적으로 삭제된 레코드 정리 (랜덤하게 10% 확률)
      if (Math.random() < 0.1) {
        try {
          await RealmService.cleanupDeletedRecords();
        } catch (cleanupError) {
          console.log('Cleanup failed:', cleanupError);
        }
      }
      
      const tastings = await RealmService.getRecentTastings();
      
      // 안전한 데이터 설정
      if (Array.isArray(tastings)) {
        setRecentTastings(tastings);
      } else {
        setRecentTastings([]);
      }
    } catch (error) {
      console.error('Error loading tastings:', error);
      showErrorToast('데이터 로드 실패', '다시 시도해주세요');
      setRecentTastings([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTastings();
    }, [loadTastings])
  );

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadTastings();
  }, [loadTastings]);

  const handleDelete = (id: string) => {
    Alert.alert(
      '삭제 확인',
      '정말 이 테이스팅 기록을 삭제하시겠습니까?',
      [
        {text: '취소', style: 'cancel'},
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await RealmService.deleteTasting(id);
              if (success) {
                showSuccessToast('삭제 완료', '테이스팅 기록이 삭제되었습니다');
                await loadTastings();
              } else {
                showErrorToast('삭제 실패', '기록을 찾을 수 없습니다');
              }
            } catch (error) {
              showErrorToast('삭제 실패', '다시 시도해주세요');
              console.error('Delete error:', error);
            }
          },
        },
      ],
    );
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${month}/${day} ${hours}:${minutes}`;
  };

  const renderTastingItem = ({item}: {item: any}) => (
    <TouchableOpacity
      style={styles.tastingItem}
      onPress={() => navigation.navigate('TastingDetail', {tastingId: item.id})}
      onLongPress={() => handleDelete(item.id)}
      hitSlop={hitSlop.default}>
      <View style={styles.itemHeader}>
        <BodyText style={styles.coffeeName}>{item.coffeeName}</BodyText>
        <BodyText style={styles.score}>{item.matchScore || 0}%</BodyText>
      </View>
      <BodyText style={styles.roasterName}>{item.roastery}</BodyText>
      {item.cafeName && <Caption style={styles.cafeName}>{item.cafeName}</Caption>}
      <Caption style={styles.date}>{formatDate(item.createdAt)}</Caption>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.GRADIENT_BROWN} />
        <BodyText style={styles.loadingText}>데이터 로딩 중...</BodyText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Heading1 style={styles.greeting}>오늘도 맛있는 커피 한잔 ☕</Heading1>
        <Caption style={styles.date}>{new Date().toLocaleDateString('ko-KR')}</Caption>
      </View>

      {/* 새 테이스팅 시작 버튼 */}
      <NavigationButton
        title="☕ 새 테이스팅 시작"
        onPress={() => navigation.navigate('새 테이스팅')}
        variant="primary"
        style={styles.startButton}
        textStyle={styles.startButtonText}
      />

      <Heading2 style={styles.sectionTitle}>최근 테이스팅</Heading2>
      
      {recentTastings && recentTastings.length > 0 ? (
        <FlatList
          data={recentTastings}
          renderItem={renderTastingItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={[Colors.GRADIENT_BROWN]}
              tintColor={Colors.GRADIENT_BROWN}
            />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <BodyText style={styles.emptyText}>아직 테이스팅 기록이 없어요</BodyText>
          <Caption style={styles.emptySubText}>새로운 커피를 기록해보세요!</Caption>
          
          {/* 빈 화면에서의 시작 버튼 */}
          <NavigationButton
            title="☕ 첫 테이스팅 시작하기"
            onPress={() => navigation.navigate('새 테이스팅')}
            variant="primary"
            style={{ ...styles.startButton, marginTop: 24 }}
            textStyle={styles.startButtonText}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND_GRAY,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.BACKGROUND_GRAY,
  },
  loadingText: {
    marginTop: 10,
    color: Colors.TEXT_SECONDARY,
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 10,
    shadowColor: Colors.SHADOW_BLACK,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  greeting: {
    marginBottom: 5,
  },
  date: {
    color: Colors.TEXT_SECONDARY,
  },
  sectionTitle: {
    marginHorizontal: 20,
    marginBottom: 10,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  tastingItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: Colors.SHADOW_BLACK,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  coffeeName: {
    fontWeight: 'bold',
    flex: 1,
  },
  score: {
    fontWeight: 'bold',
    color: Colors.SUCCESS_GREEN,
  },
  roasterName: {
    color: Colors.TEXT_SECONDARY,
    marginBottom: 2,
  },
  cafeName: {
    color: Colors.TEXT_DISABLED,
    marginBottom: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyText: {
    color: Colors.TEXT_DISABLED,
    marginBottom: 10,
  },
  emptySubText: {
    color: Colors.TEXT_DISABLED,
  },
  startButton: {
    backgroundColor: HIGColors.blue, // iOS 블루
    minHeight: 56, // 44pt보다 크게
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 12,
    shadowColor: Colors.SHADOW_BLACK,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  startButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
});