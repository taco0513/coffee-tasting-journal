import React, { useState } from 'react';
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

type MouthfeelType = 'Clean' | 'Creamy' | 'Juicy' | 'Silky';

const SensoryScreen = () => {
  const navigation = useNavigation();
  const { sensoryAttributes, updateSensoryAttributes } = useTastingStore();
  
  const [body, setBody] = useState(sensoryAttributes?.body || 3);
  const [acidity, setAcidity] = useState(sensoryAttributes?.acidity || 3);
  const [sweetness, setSweetness] = useState(sensoryAttributes?.sweetness || 3);
  const [finish, setFinish] = useState(sensoryAttributes?.finish || 3);
  const [mouthfeel, setMouthfeel] = useState<MouthfeelType>(
    sensoryAttributes?.mouthfeel || 'Clean'
  );

  const mouthfeelOptions: MouthfeelType[] = ['Clean', 'Creamy', 'Juicy', 'Silky'];

  const handleComplete = () => {
    updateSensoryAttributes({
      body,
      acidity,
      sweetness,
      finish,
      mouthfeel,
    });
    navigation.navigate('Result' as never);
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
          minimumTrackTintColor="#8B4513"
          maximumTrackTintColor="#e0e0e0"
          thumbTintColor="#8B4513"
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
              <TouchableOpacity
                key={option}
                style={[
                  styles.mouthfeelButton,
                  mouthfeel === option && styles.selectedMouthfeel,
                ]}
                onPress={() => setMouthfeel(option)}
              >
                <Text
                  style={[
                    styles.mouthfeelText,
                    mouthfeel === option && styles.selectedMouthfeelText,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Complete Button */}
        <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
          <Text style={styles.completeButtonText}>평가 완료</Text>
        </TouchableOpacity>
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  sliderSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 16,
  },
  sliderLabel: {
    fontSize: 14,
    color: '#666',
    width: 50,
  },
  valueText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
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
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedMouthfeel: {
    backgroundColor: '#8B4513',
    borderColor: '#8B4513',
  },
  mouthfeelText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  selectedMouthfeelText: {
    color: '#fff',
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