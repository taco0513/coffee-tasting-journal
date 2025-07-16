import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTastingStore } from '../stores/tastingStore';
import { NavigationButton } from '../components/common';
import { Colors } from '../constants/colors';

const RoasterNotesScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { currentTasting, updateField } = useTastingStore();
  const scannedRoasterNotes = route.params?.scannedRoasterNotes;
  
  // 초기값으로 스캔된 노트 사용
  const [notes, setNotes] = useState(scannedRoasterNotes || currentTasting.roasterNotes || '');
  
  useEffect(() => {
    if (scannedRoasterNotes) {
      console.log('스캔된 로스터 노트 적용:', scannedRoasterNotes);
      setNotes(scannedRoasterNotes);
    }
  }, [scannedRoasterNotes]);

  const handleNext = () => {
    updateField('roasterNotes', notes);
    navigation.navigate('FlavorLevel1' as never);
  };

  const handleSkip = () => {
    navigation.navigate('FlavorLevel1' as never);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        {/* Skip Button */}
        <View style={styles.skipButton}>
          <NavigationButton
            title="건너뛰기"
            onPress={handleSkip}
            variant="text"
            fullWidth={false}
          />
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressDot} />
          <View style={[styles.progressDot, styles.activeDot]} />
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
        </View>

        {/* Title */}
        <Text style={styles.title}>로스터의 컵 노트</Text>

        {/* Notes Input */}
        <View style={styles.inputContainer}>
          {scannedRoasterNotes && (
            <Text style={styles.helperText}>
              📷 OCR로 인식된 노트가 자동 입력되었습니다
            </Text>
          )}
          <TextInput
            style={styles.notesInput}
            multiline
            numberOfLines={6}
            placeholder="로스터가 제공한 맛 설명을 입력하세요
예: 블루베리, 다크 초콜릿, 꿀"
            placeholderTextColor={Colors.PLACEHOLDER}
            value={notes}
            onChangeText={setNotes}
            textAlignVertical="top"
          />
        </View>

        {/* Next Button */}
        <NavigationButton
          title="다음"
          onPress={handleNext}
          variant="primary"
          style={styles.button}
        />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1,
  },
  skipText: {
    fontSize: 16,
    color: Colors.TEXT_SECONDARY,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
  },
  activeDot: {
    backgroundColor: '#8B4513',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 40,
  },
  inputContainer: {
    flex: 1,
    marginBottom: 20,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    minHeight: 200,
    backgroundColor: '#f8f8f8',
  },
  button: {
    backgroundColor: '#8B4513',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 40,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  helperText: {
    fontSize: 14,
    color: Colors.PRIMARY,
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default RoasterNotesScreen;