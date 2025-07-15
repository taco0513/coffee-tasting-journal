import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../types/navigation';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';

const HomeScreen = () => {
    const navigation = useNavigation<HomeScreenNavigationProp>();
  // 임시 데이터 (나중에 실제 데이터로 교체)
  const recentTastings = [
    { id: '1', coffee: '에티오피아 예가체프', date: '2024-01-15', score: 85 },
    { id: '2', coffee: '콜롬비아 핑크 버번', date: '2024-01-14', score: 88 },
    { id: '3', coffee: '케냐 AA', date: '2024-01-13', score: 82 },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
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

        {/* 최근 기록 */}
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>최근 테이스팅</Text>
          
          {recentTastings.length > 0 ? (
            recentTastings.map((tasting) => (
              <View key={tasting.id} style={styles.tastingCard}>
                <View style={styles.cardLeft}>
                  <Text style={styles.coffeeName}>{tasting.coffee}</Text>
                  <Text style={styles.tastingDate}>{formatDate(tasting.date)}</Text>
                </View>
                <View style={styles.cardRight}>
                  <Text style={styles.score}>{tasting.score}%</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>
              첫 테이스팅을 시작해보세요! 🎉
            </Text>
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
    fontWeight: '500',
    color: '#000000',
  },
  tastingDate: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  cardRight: {
    backgroundColor: '#000000',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  score: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default HomeScreen;