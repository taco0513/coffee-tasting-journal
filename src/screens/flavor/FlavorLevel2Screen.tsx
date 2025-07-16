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
import {
  hitSlop,
  HIGColors,
  HIGConstants,
} from '../../styles/common';
import { NavigationButton } from '../../components/common';
import { FONT_SIZE } from '../../constants/typography';
import { Colors } from '../../constants/colors';

interface FlavorPath {
  level1?: string;
  level2?: string;
  level3?: string;
  level4?: string;
}
import { flavorWheel } from '../../data/flavorWheel';

const FlavorLevel2Screen = () => {
  const navigation = useNavigation();
  const { selectedFlavors, setSelectedFlavors } = useTastingStore();
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>(
    selectedFlavors?.map(f => f.level2).filter(Boolean) || []
  );

  // Group subcategories by their parent category
  const level1Categories = selectedFlavors?.map(f => f.level1).filter(Boolean) || [];
  const categorizedSubcategories = level1Categories.reduce((acc, category) => {
    const subcategories = flavorWheel[category as keyof typeof flavorWheel] || [];
    if (subcategories.length > 0) {
      acc[category] = subcategories;
    }
    return acc;
  }, {} as Record<string, string[]>);

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
    // Level 1 선택값들과 Level 2를 결합해서 저장
    const level1Categories = selectedFlavors?.map(f => f.level1).filter(Boolean) || [];
    const newFlavors: FlavorPath[] = [];
    
    // Level 1 카테고리별로 Level 2 서브카테고리 매핑
    level1Categories.forEach(level1 => {
      const relatedSubcategories = selectedSubcategories.filter(sub => 
        (flavorWheel[level1 as keyof typeof flavorWheel] || []).includes(sub)
      );
      
      if (relatedSubcategories.length > 0) {
        relatedSubcategories.forEach(level2 => {
          newFlavors.push({ level1, level2 });
        });
      } else {
        newFlavors.push({ level1 });
      }
    });
    
    setSelectedFlavors(newFlavors);
    navigation.navigate('FlavorLevel3' as never);
  };

  const handleSkip = () => {
    navigation.navigate('Sensory' as never);
  };

  const isNextEnabled = selectedSubcategories.length > 0;

  return (
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
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
        <View style={[styles.progressDot, styles.activeDot]} />
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
      </View>

      {/* Title */}
      <Text style={styles.title}>플레이버 선택 (Level 2)</Text>
      <Text style={styles.subtitle}>세부 맛을 선택하세요</Text>

      {/* Subcategories by Category */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {Object.entries(categorizedSubcategories).map(([category, subcategories]) => (
          <View key={category} style={styles.categorySection}>
            <Text style={styles.sectionHeader}>{category} 하위</Text>
            <View style={styles.gridContainer}>
              {subcategories.map((subcategory) => {
                const isSelected = selectedSubcategories.includes(subcategory);
                return (
                  <TouchableOpacity
                    key={subcategory}
                    style={[
                      styles.categoryButton,
                      isSelected && styles.selectedButton,
                    ]}
                    onPress={() => handleSubcategoryPress(subcategory)}
                    hitSlop={hitSlop.small}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        isSelected && styles.selectedText,
                      ]}
                    >
                      {subcategory}
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
          </View>
        ))}
      </ScrollView>

      {/* Next Button */}
      <NavigationButton
        title="다음"
        onPress={handleNext}
        disabled={!isNextEnabled}
        variant="primary"
        style={styles.nextButton}
      />
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 30,
  },
  scrollView: {
    flex: 1,
  },
  categorySection: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginHorizontal: -6,
  },
  categoryButton: {
    backgroundColor: HIGColors.systemBackground,
    borderWidth: 2,
    borderColor: HIGColors.gray4,
    borderRadius: HIGConstants.BORDER_RADIUS_LARGE,
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingVertical: HIGConstants.SPACING_MD,
    margin: HIGConstants.SPACING_XS,
    minHeight: HIGConstants.MIN_TOUCH_TARGET,
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
    fontSize: HIGConstants.FONT_SIZE_MEDIUM,
    fontWeight: '600',
    color: HIGColors.label,
    textAlign: 'center',
  },
  selectedText: {
    color: '#FFFFFF',
  },
  nextButton: {
    marginBottom: 40,
    marginTop: 20,
    marginHorizontal: 20,
  },
});

export default FlavorLevel2Screen;