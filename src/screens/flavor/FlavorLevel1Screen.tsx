import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTastingStore } from '../../stores/tastingStore';
import { flavorWheelKorean } from '../../data/flavorWheelKorean';
import {
  HIGColors,
  HIGConstants,
  hitSlop,
} from '../../styles/common';
import { NavigationButton } from '../../components/common';
import { FONT_SIZE } from '../../constants/typography';

const FlavorLevel1Screen = () => {
  const navigation = useNavigation();
  const { selectedFlavors, setSelectedFlavors } = useTastingStore();
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    selectedFlavors?.map(f => f.level1).filter(Boolean) || []
  );

  const categories = [
    'Fruity', 'Sour/Fermented', 'Green/Vegetative',
    'Other', 'Roasted', 'Spices',
    'Nutty/Cocoa', 'Sweet', 'Floral'
  ];

  // 화면 크기에 따른 동적 계산
  const screenWidth = Dimensions.get('window').width;
  const padding = 20;
  const gap = HIGConstants.SPACING_SM;
  const itemsPerRow = 3;
  const availableWidth = screenWidth - (padding * 2) - (gap * (itemsPerRow - 1));
  const itemWidth = Math.max(HIGConstants.MIN_TOUCH_TARGET * 1.5, availableWidth / itemsPerRow);

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
    const newFlavors = selectedCategories.map(category => ({ 
      level1: category
    }));
    setSelectedFlavors(newFlavors);
    navigation.navigate('FlavorLevel2' as never);
  };

  const isNextEnabled = selectedCategories.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
          {categories.map((category, index) => {
            const isSelected = selectedCategories.includes(category);
            return (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  { width: itemWidth, height: Math.max(HIGConstants.MIN_TOUCH_TARGET * 1.5, itemWidth) },
                  isSelected && styles.selectedButton,
                ]}
                onPress={() => handleCategoryPress(category)}
                hitSlop={hitSlop.small}
              >
                <Text
                  style={[
                    styles.categoryText,
                    isSelected && styles.selectedText,
                  ]}
                >
                  {category}
                </Text>
                <Text
                  style={[
                    styles.categorySubtext,
                    isSelected && styles.selectedText,
                  ]}
                >
                  ({flavorWheelKorean.level1[category as keyof typeof flavorWheelKorean.level1]})
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
          })}
        </View>

        {/* Next Button */}
        <NavigationButton
          title="다음"
          onPress={handleNext}
          disabled={!isNextEnabled}
          variant="primary"
          style={styles.nextButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
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
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 40,
    gap: HIGConstants.SPACING_SM,
  },
  categoryButton: {
    minHeight: HIGConstants.MIN_TOUCH_TARGET * 1.5,
    minWidth: HIGConstants.MIN_TOUCH_TARGET * 1.5,
    backgroundColor: HIGColors.systemBackground,
    borderWidth: 2,
    borderColor: HIGColors.gray4,
    borderRadius: HIGConstants.BORDER_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    padding: HIGConstants.SPACING_SM,
    marginBottom: HIGConstants.SPACING_SM,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedButton: {
    backgroundColor: HIGColors.blue,
    borderColor: HIGColors.blue,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    transform: [{ scale: 1.02 }],
  },
  categoryText: {
    fontSize: HIGConstants.FONT_SIZE_SMALL,
    fontWeight: '600',
    color: HIGColors.label,
    textAlign: 'center',
    lineHeight: 16,
  },
  categorySubtext: {
    fontSize: FONT_SIZE.TINY, // HIG 최소 크기 준수
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 13,
  },
  selectedText: {
    color: '#FFFFFF',
  },
  nextButton: {
    marginTop: 20,
  },
});

export default FlavorLevel1Screen;