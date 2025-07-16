import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView} from 'react-native';
import {useTastingStore} from '../stores/tastingStore';
import {useToastStore} from '../stores/toastStore';
import {
  commonLayoutStyles,
  hitSlop,
  HIGColors,
} from '../styles/common';
import { NavigationButton } from '../components/common';
import { Colors } from '../constants/colors';

export default function ResultScreen({navigation}: any) {
  const {currentTasting, matchScore, reset, saveTasting} = useTastingStore();
  const {showSuccessToast, showErrorToast} = useToastStore();
  const [isSaving, setIsSaving] = useState(false);

  // 저장 버튼 핸들러
  const handleSave = async () => {
    if (isSaving) return; // 중복 저장 방지
    
    setIsSaving(true);
    try {
      await saveTasting();
      showSuccessToast('저장 완료', '테이스팅이 저장되었습니다');
      
      // 2초 후 홈 화면으로 이동
      setTimeout(() => {
        reset();
        navigation.reset({
          index: 0,
          routes: [{name: '홈'}],
        });
      }, 2000);
    } catch (error) {
      console.error('Save error:', error);
      showErrorToast('저장 실패', '저장에 실패했습니다');
      setIsSaving(false); // 실패 시 다시 저장 가능하도록
    }
  };

  const handleNewTasting = () => {
    reset();
    // navigation.navigate 대신 navigation.reset 사용
    navigation.reset({
      index: 0,
      routes: [{name: '새 테이스팅'}],
    });
  };

  const handleGoHome = () => {
    reset();
    // navigation.navigate 대신 navigation.reset 사용
    navigation.reset({
      index: 0,
      routes: [{name: '홈'}],
    });
  };

  // currentTasting이 없으면 에러 방지
  if (!currentTasting) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>데이터 로드 중...</Text>
      </View>
    );
  }

  // 맛 노트 정리 - null 체크 추가
  const selectedFlavorNotes = currentTasting.selectedFlavors || [];
  const flavorList = selectedFlavorNotes.map((path: any) => {
    const parts = [];
    if (path.level1) parts.push(path.level1);
    if (path.level2) parts.push(path.level2);
    if (path.level3) parts.push(path.level3);
    if (path.level4) parts.push(path.level4);
    return parts.join(' > ');
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>테이스팅 완료!</Text>
        <Text style={styles.score}>{matchScore || 0}% 일치</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>커피 정보</Text>
        <Text style={styles.info}>카페: {currentTasting.cafeName || '-'}</Text>
        <Text style={styles.info}>로스터리: {currentTasting.roastery || '-'}</Text>
        <Text style={styles.info}>커피: {currentTasting.coffeeName || '-'}</Text>
      </View>

      {currentTasting.roasterNotes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>로스터 노트</Text>
          <Text style={styles.info}>{currentTasting.roasterNotes}</Text>
        </View>
      )}

      {flavorList.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>내가 선택한 맛</Text>
          {flavorList.map((flavor: string, index: number) => (
            <Text key={index} style={styles.flavorItem}>
              • {flavor}
            </Text>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>감각 평가</Text>
        <Text style={styles.info}>바디감: {currentTasting.body || 3}/5</Text>
        <Text style={styles.info}>산미: {currentTasting.acidity || 3}/5</Text>
        <Text style={styles.info}>단맛: {currentTasting.sweetness || 3}/5</Text>
        <Text style={styles.info}>여운: {currentTasting.finish || 3}/5</Text>
        <Text style={styles.info}>입안 느낌: {currentTasting.mouthfeel || 'Clean'}</Text>
      </View>

      <View style={[commonLayoutStyles.buttonContainer, styles.buttonContainer]}>
        <NavigationButton
          title={isSaving ? '저장 중...' : '저장하기'}
          onPress={handleSave}
          disabled={isSaving}
          variant="primary"
          style={{ backgroundColor: HIGColors.green }}
        />
        
        <View style={commonLayoutStyles.buttonGroup}>
          <NavigationButton
            title="새 테이스팅"
            onPress={handleNewTasting}
            variant="primary"
            style={commonLayoutStyles.buttonFlex}
            fullWidth={false}
          />
          <NavigationButton
            title="홈으로"
            onPress={handleGoHome}
            variant="secondary"
            style={commonLayoutStyles.buttonFlex}
            fullWidth={false}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  score: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.SUCCESS_GREEN,
  },
  section: {
    backgroundColor: 'white',
    padding: 15,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  info: {
    fontSize: 16,
    marginBottom: 5,
  },
  flavorItem: {
    fontSize: 16,
    marginBottom: 3,
  },
  buttonContainer: {
    // 공통 스타일로 대체됨 - 추가적인 커스텀 스타일만 여기에
  },
});