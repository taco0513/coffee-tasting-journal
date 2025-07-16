import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useNavigation } from '@react-navigation/native';
import { useTastingStore } from '../stores/tastingStore';
import { NavigationButton } from '../components/common';
import { HIGConstants, hitSlop, HIGColors } from '../styles/common';
import { FONT_SIZE } from '../constants/typography';

type MouthfeelType = 'Clean' | 'Creamy' | 'Juicy' | 'Silky';

const SensoryScreen = () => {
  const navigation = useNavigation();
  const { currentTasting, updateField, saveTasting } = useTastingStore();
  
  const [body, setBody] = useState(currentTasting.body || 3);
  const [acidity, setAcidity] = useState(currentTasting.acidity || 3);
  const [sweetness, setSweetness] = useState(currentTasting.sweetness || 3);
  const [finish, setFinish] = useState(currentTasting.finish || 3);
  const [mouthfeel, setMouthfeel] = useState<MouthfeelType>(
    currentTasting.mouthfeel || 'Clean'
  );

  const mouthfeelOptions: MouthfeelType[] = ['Clean', 'Creamy', 'Juicy', 'Silky'];

  // Mouthfeel Button Component
  const MouthfeelButton = ({ option }: { option: MouthfeelType }) => {
    const isSelected = mouthfeel === option;

    return (
      <TouchableOpacity
        style={[
          styles.mouthfeelButton,
          isSelected && styles.selectedMouthfeel,
        ]}
        onPress={() => setMouthfeel(option)}
        hitSlop={hitSlop.small}
      >
        <Text
          style={[
            styles.mouthfeelText,
            isSelected && styles.selectedMouthfeelText,
          ]}
        >
          {option}
        </Text>
        {isSelected && (
          <Text style={{
            position: 'absolute',
            top: 5,
            right: 5,
            color: 'white',
            fontSize: 16,
            fontWeight: 'bold'
          }}>✓</Text>
        )}
      </TouchableOpacity>
    );
  };


  const handleComplete = async () => {
    updateField('body', body);
    updateField('acidity', acidity);
    updateField('sweetness', sweetness);
    updateField('finish', finish);
    updateField('mouthfeel', mouthfeel);
    
    try {
      saveTasting();
      navigation.navigate('Result' as never);
    } catch (error) {
      console.error('Error saving tasting:', error);
      // 에러가 발생해도 결과 화면으로 이동
      navigation.navigate('Result' as never);
    }
  };

  const renderSlider = (
    title: string,
    value: number,
    setValue: (value: number) => void,
    leftLabel: string,
    rightLabel: string
  ) => (
    <View style={styles.sliderSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>{leftLabel}</Text>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={5}
          value={value}
          onValueChange={setValue}
          step={1}
          minimumTrackTintColor={HIGColors.blue}
          maximumTrackTintColor={HIGColors.gray4}
          thumbTintColor={HIGColors.blue}
        />
        <Text style={styles.sliderLabel}>{rightLabel}</Text>
      </View>
      <Text style={styles.valueText}>{Math.round(value)}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
          <View style={[styles.progressDot, styles.activeDot]} />
        </View>


        {/* Title */}
        <Text style={styles.title}>감각 평가</Text>
        <Text style={styles.subtitle}>커피의 감각적 특성을 평가해주세요</Text>

        {/* Sensory Attributes */}
        {renderSlider('바디감', body, setBody, '가벼움', '무거움')}
        {renderSlider('산미', acidity, setAcidity, '약함', '강함')}
        {renderSlider('단맛', sweetness, setSweetness, '없음', '강함')}
        {renderSlider('여운', finish, setFinish, '짧음', '길음')}

        {/* Mouthfeel Section */}
        <View style={styles.mouthfeelSection}>
          <Text style={styles.sectionTitle}>입안 느낌</Text>
          <View style={styles.mouthfeelContainer}>
            {mouthfeelOptions.map((option) => (
              <MouthfeelButton key={option} option={option} />
            ))}
          </View>
        </View>

        {/* Complete Button */}
        <NavigationButton
          title="평가 완료"
          onPress={handleComplete}
          variant="primary"
          style={{ backgroundColor: '#34C759' }} // 성공 색상 유지
        />
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
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
    gap: HIGConstants.SPACING_SM,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: HIGColors.gray4,
  },
  activeDot: {
    backgroundColor: HIGColors.blue,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: HIGColors.label,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
    marginBottom: 40,
  },
  sliderSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: 16,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slider: {
    flex: 1,
    height: HIGConstants.MIN_TOUCH_TARGET,
    marginHorizontal: 16,
  },
  sliderTrack: {
    height: HIGConstants.MIN_TOUCH_TARGET,
    borderRadius: HIGConstants.MIN_TOUCH_TARGET / 2,
  },
  sliderThumb: {
    width: HIGConstants.MIN_TOUCH_TARGET,
    height: HIGConstants.MIN_TOUCH_TARGET,
    borderRadius: HIGConstants.MIN_TOUCH_TARGET / 2,
    backgroundColor: HIGColors.blue,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sliderLabel: {
    fontSize: 14,
    color: HIGColors.secondaryLabel,
    width: 50,
    textAlign: 'center',
  },
  valueText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: HIGColors.blue,
    textAlign: 'center',
    marginTop: 8,
  },
  mouthfeelSection: {
    marginBottom: 40,
  },
  mouthfeelContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  mouthfeelButton: {
    width: '48%',
    minHeight: HIGConstants.MIN_TOUCH_TARGET,
    backgroundColor: HIGColors.systemBackground,
    borderWidth: 2,
    borderColor: HIGColors.gray4,
    borderRadius: HIGConstants.BORDER_RADIUS,
    paddingVertical: HIGConstants.SPACING_MD,
    paddingHorizontal: HIGConstants.SPACING_SM,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: HIGConstants.SPACING_MD,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedMouthfeel: {
    backgroundColor: HIGColors.blue,
    borderColor: HIGColors.blue,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    transform: [{ scale: 1.02 }],
  },
  mouthfeelText: {
    fontSize: HIGConstants.FONT_SIZE_MEDIUM,
    fontWeight: '600',
    color: HIGColors.label,
    textAlign: 'center',
  },
  selectedMouthfeelText: {
    color: '#FFFFFF',
  },
  completeButton: {
    backgroundColor: '#8B4513',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 40,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default SensoryScreen;