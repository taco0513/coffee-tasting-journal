import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import RealmService from '../services/realm/RealmService';
import { Colors } from '../constants/colors';

interface Statistics {
  totalTastings: number;
  averageScore: number;
  firstTastingDays: number;
}

interface TopRoaster {
  name: string;
  count: number;
  avgScore: number;
}

interface TopCoffee {
  name: string;
  roastery: string;
  count: number;
}

interface TopCafe {
  name: string;
  count: number;
}

interface FlavorProfile {
  flavor: string;
  count: number;
  percentage: number;
}

const StatsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Statistics | null>(null);
  const [topRoasters, setTopRoasters] = useState<TopRoaster[]>([]);
  const [topCoffees, setTopCoffees] = useState<TopCoffee[]>([]);
  const [topCafes, setTopCafes] = useState<TopCafe[]>([]);
  const [flavorProfile, setFlavorProfile] = useState<FlavorProfile[]>([]);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const realmService = RealmService.getInstance();
      
      // Load all statistics
      const basicStats = realmService.getStatistics();
      const roasters = realmService.getTopRoasters(5);
      const coffees = realmService.getTopCoffees(5);
      const cafes = realmService.getTopCafes(5);
      const flavors = realmService.getFlavorProfile();

      setStats(basicStats);
      setTopRoasters(roasters);
      setTopCoffees(coffees);
      setTopCafes(cafes);
      setFlavorProfile(flavors);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B4513" />
          <Text style={styles.loadingText}>통계를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!stats || stats.totalTastings === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyText}>아직 테이스팅 기록이 없습니다</Text>
          <Text style={styles.emptySubtext}>
            첫 테이스팅을 기록하면 통계를 볼 수 있습니다
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>나의 커피 통계</Text>
          <Text style={styles.headerSubtitle}>커피 여정을 한눈에</Text>
        </View>

        {/* 기본 통계 */}
        <View style={styles.section}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.totalTastings}</Text>
              <Text style={styles.statLabel}>총 테이스팅</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.averageScore}%</Text>
              <Text style={styles.statLabel}>평균 매칭</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.firstTastingDays}일</Text>
              <Text style={styles.statLabel}>커피 여정</Text>
            </View>
          </View>
        </View>

        {/* TOP 로스터리 */}
        {topRoasters.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏆 가장 많이 마신 로스터리</Text>
            <View style={styles.rankingCard}>
              {topRoasters.map((roaster, index) => (
                <View key={roaster.name} style={styles.rankingItem}>
                  <View style={styles.rankingLeft}>
                    <Text style={styles.rankNumber}>{index + 1}</Text>
                    <View style={styles.rankingInfo}>
                      <Text style={styles.rankName}>{roaster.name}</Text>
                      <Text style={styles.rankScore}>평균 {roaster.avgScore}%</Text>
                    </View>
                  </View>
                  <Text style={styles.rankCount}>{roaster.count}회</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* TOP 커피 */}
        {topCoffees.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>☕ 가장 많이 마신 커피</Text>
            <View style={styles.rankingCard}>
              {topCoffees.map((coffee, index) => (
                <View key={`${coffee.roastery}-${coffee.name}`} style={styles.rankingItem}>
                  <View style={styles.rankingLeft}>
                    <Text style={styles.rankNumber}>{index + 1}</Text>
                    <View style={styles.rankingInfo}>
                      <Text style={styles.rankName} numberOfLines={1}>
                        {coffee.name}
                      </Text>
                      <Text style={styles.rankSubtext}>{coffee.roastery}</Text>
                    </View>
                  </View>
                  <Text style={styles.rankCount}>{coffee.count}회</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* TOP 카페 */}
        {topCafes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏠 자주 방문한 카페</Text>
            <View style={styles.rankingCard}>
              {topCafes.map((cafe, index) => (
                <View key={cafe.name} style={styles.rankingItem}>
                  <View style={styles.rankingLeft}>
                    <Text style={styles.rankNumber}>{index + 1}</Text>
                    <View style={styles.rankingInfo}>
                      <Text style={styles.rankName}>{cafe.name}</Text>
                    </View>
                  </View>
                  <Text style={styles.rankCount}>{cafe.count}회</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 맛 프로필 */}
        {flavorProfile.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✨ 나의 맛 프로필</Text>
            <View style={styles.flavorCard}>
              {flavorProfile.map((flavor) => (
                <View key={flavor.flavor} style={styles.flavorItem}>
                  <View style={styles.flavorLeft}>
                    <Text style={styles.flavorName}>{flavor.flavor}</Text>
                    <View style={styles.flavorBarContainer}>
                      <View 
                        style={[
                          styles.flavorBar, 
                          { width: `${flavor.percentage}%` }
                        ]} 
                      />
                    </View>
                  </View>
                  <Text style={styles.flavorCount}>{flavor.count}회</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.bottomSpacer} />
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.TEXT_TERTIARY,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    textAlign: 'center',
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.TEXT_SECONDARY,
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
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
  },
  rankingCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
  },
  rankingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  rankingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  rankingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rankNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#8B4513',
    width: 30,
  },
  rankingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  rankName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  rankSubtext: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
    marginTop: 2,
  },
  rankScore: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
    marginTop: 2,
  },
  rankCount: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.TEXT_TERTIARY,
  },
  flavorCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
  },
  flavorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  flavorLeft: {
    flex: 1,
    marginRight: 16,
  },
  flavorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 6,
  },
  flavorBarContainer: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  flavorBar: {
    height: '100%',
    backgroundColor: '#8B4513',
    borderRadius: 4,
  },
  flavorCount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.TEXT_SECONDARY,
  },
  bottomSpacer: {
    height: 40,
  },
});

export default StatsScreen;