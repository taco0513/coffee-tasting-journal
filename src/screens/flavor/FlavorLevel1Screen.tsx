import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTastingStore } from '../../stores/tastingStore';

const FlavorLevel1Screen = () => {
  const navigation = useNavigation();
  const { selectedFlavors, setFlavorLevel } = useTastingStore();
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    selectedFlavors?.level1 || []
  );

  const categories = [
    'Fruity', 'Sour/Fermented', 'Green/Vegetative',
    'Other', 'Roasted', 'Spices',
    'Nutty/Cocoa', 'Sweet', 'Floral'
  ];

  const handleCategoryPress = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  const handleNext = () => {
    setFlavorLevel(1, selectedCategories);
    navigation.navigate('FlavorLevel2' as never);
  };

  const isNextEnabled = selectedCategories.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
        <View style={[styles.progressDot, styles.activeDot]} />
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
      </View>

      {/* Title */}
      <Text style={styles.title}>플레이버 선택 (Level 1)</Text>
      <Text style={styles.subtitle}>해당하는 맛을 모두 선택하세요</Text>

      {/* Categories Grid */}
      <View style={styles.gridContainer}>
        {categories.map((category, index) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategories.includes(category) && styles.selectedButton,
              index % 3 !== 2 && styles.rightMargin,
              index < 6 && styles.bottomMargin,
            ]}
            onPress={() => handleCategoryPress(category)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategories.includes(category) && styles.selectedText,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

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
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 40,
  },
  categoryButton: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  selectedButton: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  rightMargin: {
    marginRight: '5%',
  },
  bottomMargin: {
    marginBottom: '5%',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    textAlign: 'center',
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

export default FlavorLevel1Screen;