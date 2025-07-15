import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTastingStore } from '../../stores/tastingStore';
import { flavorWheel } from '../../data/flavorWheel';

const FlavorLevel2Screen = () => {
  const navigation = useNavigation();
  const { selectedFlavors, setFlavorLevel } = useTastingStore();
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>(
    selectedFlavors?.level2 || []
  );

  // Get all subcategories for selected level1 categories
  const availableSubcategories = selectedFlavors.level1.flatMap(
    category => flavorWheel[category as keyof typeof flavorWheel] || []
  );

  const handleSubcategoryPress = (subcategory: string) => {
    setSelectedSubcategories(prev => {
      if (prev.includes(subcategory)) {
        return prev.filter(c => c !== subcategory);
      } else {
        return [...prev, subcategory];
      }
    });
  };

  const handleNext = () => {
    setFlavorLevel(2, selectedSubcategories);
    navigation.navigate('FlavorLevel3' as never);
  };

  const handleSkip = () => {
    navigation.navigate('Sensory' as never);
  };

  const isNextEnabled = selectedSubcategories.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Skip Button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>건너뛰기</Text>
      </TouchableOpacity>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
        <View style={[styles.progressDot, styles.activeDot]} />
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
      </View>

      {/* Title */}
      <Text style={styles.title}>플레이버 선택 (Level 2)</Text>
      <Text style={styles.subtitle}>세부 맛을 선택하세요</Text>

      {/* Subcategories List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.categoriesContainer}>
          {availableSubcategories.map((subcategory) => (
            <TouchableOpacity
              key={subcategory}
              style={[
                styles.categoryButton,
                selectedSubcategories.includes(subcategory) && styles.selectedButton,
              ]}
              onPress={() => handleSubcategoryPress(subcategory)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedSubcategories.includes(subcategory) && styles.selectedText,
                ]}
              >
                {subcategory}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Next Button */}
      <TouchableOpacity
        style={[
          styles.button,
          !isNextEnabled && styles.disabledButton,
        ]}
        onPress={handleNext}
        disabled={!isNextEnabled}
      >
        <Text
          style={[
            styles.buttonText,
            !isNextEnabled && styles.disabledButtonText,
          ]}
        >
          다음
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
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
    color: '#666',
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  scrollView: {
    flex: 1,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingBottom: 20,
  },
  categoryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    margin: 6,
  },
  selectedButton: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  selectedText: {
    color: '#fff',
  },
  button: {
    backgroundColor: '#8B4513',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#e0e0e0',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  disabledButtonText: {
    color: '#999',
  },
});

export default FlavorLevel2Screen;