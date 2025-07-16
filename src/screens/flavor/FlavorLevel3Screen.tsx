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
import { flavorLevel3 } from '../../data/flavorWheel';

const FlavorLevel3Screen = () => {
  const navigation = useNavigation();
  const { selectedFlavors, setSelectedFlavors } = useTastingStore();
  const [selectedLevel3, setSelectedLevel3] = useState<string[]>(
    selectedFlavors?.map(f => f.level3).filter(Boolean) || []
  );

  // Group level3 options by their parent level2 category
  const level2Categories = selectedFlavors?.map(f => f.level2).filter(Boolean) || [];
  const categorizedLevel3 = level2Categories.reduce((acc, level2Item) => {
    const level3Options = flavorLevel3[level2Item as keyof typeof flavorLevel3] || [];
    if (level3Options.length > 0) {
      acc[level2Item] = level3Options;
    }
    return acc;
  }, {} as Record<string, string[]>);

  // Check if there are any level3 options available
  const hasLevel3Options = Object.keys(categorizedLevel3).length > 0;

  useEffect(() => {
    // If no level3 options exist, skip to FlavorLevel4 screen
    if (!hasLevel3Options) {
      navigation.navigate('FlavorLevel4' as never);
    }
  }, [hasLevel3Options, navigation]);

  const handleLevel3Press = (item: string) => {
    setSelectedLevel3(prev => {
      if (prev.includes(item)) {
        return prev.filter(i => i !== item);
      } else {
        return [...prev, item];
      }
    });
  };

  const handleNext = () => {
    // 기존 FlavorPath들을 바탕으로 Level 3 추가
    const newFlavors: FlavorPath[] = [];
    
    selectedFlavors?.forEach(flavor => {
      const relatedLevel3 = selectedLevel3.filter(level3 => 
        (flavorLevel3[flavor.level2 as keyof typeof flavorLevel3] || []).includes(level3)
      );
      
      if (relatedLevel3.length > 0) {
        relatedLevel3.forEach(level3 => {
          newFlavors.push({ ...flavor, level3 });
        });
      } else {
        newFlavors.push(flavor);
      }
    });
    
    setSelectedFlavors(newFlavors);
    navigation.navigate('FlavorLevel4' as never);
  };

  const handleSkip = () => {
    navigation.navigate('FlavorLevel4' as never);
  };

  const isNextEnabled = selectedLevel3.length > 0;

  // Don't render if no options available
  if (!hasLevel3Options) {
    return null;
  }

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
        <View style={styles.progressDot} />
        <View style={[styles.progressDot, styles.activeDot]} />
        <View style={styles.progressDot} />
      </View>

      {/* Title */}
      <Text style={styles.title}>플레이버 선택 (Level 3)</Text>
      <Text style={styles.subtitle}>구체적인 맛을 선택하세요</Text>

      {/* Level3 options by category */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {Object.entries(categorizedLevel3).map(([category, items]) => (
          <View key={category} style={styles.categorySection}>
            <Text style={styles.sectionHeader}>{category} 하위</Text>
            <View style={styles.gridContainer}>
              {items.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.itemButton,
                    selectedLevel3.includes(item) && styles.selectedButton,
                  ]}
                  onPress={() => handleLevel3Press(item)}
                  hitSlop={hitSlop.small}
                >
                  <Text
                    style={[
                      styles.itemText,
                      selectedLevel3.includes(item) && styles.selectedText,
                    ]}
                  >
                    {item}
                  </Text>
                  {selectedLevel3.includes(item) && (
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
              ))}
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
    color: HIGColors.label,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginHorizontal: -6,
  },
  itemButton: {
    minHeight: HIGConstants.MIN_TOUCH_TARGET,
    backgroundColor: HIGColors.systemBackground,
    borderWidth: 1,
    borderColor: HIGColors.gray4,
    borderRadius: HIGConstants.BORDER_RADIUS_LARGE,
    paddingHorizontal: HIGConstants.SPACING_LG,
    paddingVertical: HIGConstants.SPACING_MD,
    margin: HIGConstants.SPACING_XS,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: HIGColors.blue,
    borderColor: HIGColors.blue,
  },
  itemText: {
    fontSize: HIGConstants.FONT_SIZE_MEDIUM,
    fontWeight: '500',
    color: HIGColors.label,
    textAlign: 'center',
  },
  selectedText: {
    color: '#FFFFFF',
  },
  nextButton: {
    marginBottom: 40,
    marginTop: 20,
  },
});

export default FlavorLevel3Screen;