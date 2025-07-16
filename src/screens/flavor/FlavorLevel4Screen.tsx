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
import { flavorLevel4 } from '../../data/flavorWheel';

const FlavorLevel4Screen = () => {
  const navigation = useNavigation();
  const { selectedFlavors, setSelectedFlavors } = useTastingStore();
  const [selectedDescriptors, setSelectedDescriptors] = useState<string[]>(
    selectedFlavors?.map(f => f.level4).filter(Boolean) || []
  );

  // Group descriptors by their parent level3 item
  const level3Categories = selectedFlavors?.map(f => f.level3).filter(Boolean) || [];
  const categorizedDescriptors = level3Categories.reduce((acc, level3Item) => {
    const descriptors = flavorLevel4[level3Item as keyof typeof flavorLevel4] || [];
    if (descriptors.length > 0) {
      acc[level3Item] = descriptors;
    }
    return acc;
  }, {} as Record<string, string[]>);

  // Check if there are any descriptors available
  const hasDescriptors = Object.keys(categorizedDescriptors).length > 0;

  const handleDescriptorPress = (descriptor: string) => {
    setSelectedDescriptors(prev => {
      if (prev.includes(descriptor)) {
        return prev.filter(d => d !== descriptor);
      } else {
        return [...prev, descriptor];
      }
    });
  };

  const handleNext = () => {
    // 기존 FlavorPath들을 바탕으로 Level 4 추가
    const newFlavors: FlavorPath[] = [];
    
    selectedFlavors?.forEach(flavor => {
      const relatedLevel4 = selectedDescriptors.filter(level4 => 
        (flavorLevel4[flavor.level3 as keyof typeof flavorLevel4] || []).includes(level4)
      );
      
      if (relatedLevel4.length > 0) {
        relatedLevel4.forEach(level4 => {
          newFlavors.push({ ...flavor, level4 });
        });
      } else {
        newFlavors.push(flavor);
      }
    });
    
    setSelectedFlavors(newFlavors);
    navigation.navigate('Sensory' as never);
  };

  const handleSkip = () => {
    navigation.navigate('Sensory' as never);
  };

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
        <View style={styles.progressDot} />
        <View style={[styles.progressDot, styles.activeDot]} />
      </View>

      {/* Title */}
      <Text style={styles.title}>플레이버 선택 (Level 4)</Text>
      <Text style={styles.subtitle}>맛의 특성을 선택하세요 (선택사항)</Text>

      {/* Descriptors by category */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {hasDescriptors ? (
          Object.entries(categorizedDescriptors).map(([category, descriptors]) => (
            <View key={category} style={styles.categorySection}>
              <Text style={styles.sectionHeader}>{category} 특성</Text>
              <View style={styles.gridContainer}>
                {descriptors.map((descriptor) => (
                  <TouchableOpacity
                    key={descriptor}
                    style={[
                      styles.descriptorButton,
                      selectedDescriptors.includes(descriptor) && styles.selectedButton,
                    ]}
                    onPress={() => handleDescriptorPress(descriptor)}
                    hitSlop={hitSlop.small}
                  >
                    <Text
                      style={[
                        styles.descriptorText,
                        selectedDescriptors.includes(descriptor) && styles.selectedText,
                      ]}
                    >
                      {descriptor}
                    </Text>
                    {selectedDescriptors.includes(descriptor) && (
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
          ))
        ) : (
          <View style={styles.noDescriptorsContainer}>
            <Text style={styles.noDescriptorsText}>
              선택한 맛에 대한 세부 특성이 없습니다.
            </Text>
            <Text style={styles.noDescriptorsSubtext}>
              다음 단계로 진행하거나 건너뛸 수 있습니다.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Next Button - Always enabled since selections are optional */}
      <NavigationButton
        title="다음"
        onPress={handleNext}
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
  descriptorButton: {
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
  descriptorText: {
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
  noDescriptorsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 60,
  },
  noDescriptorsText: {
    fontSize: 18,
    fontWeight: '600',
    color: HIGColors.secondaryLabel,
    textAlign: 'center',
    marginBottom: 12,
  },
  noDescriptorsSubtext: {
    fontSize: 16,
    color: HIGColors.tertiaryLabel,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default FlavorLevel4Screen;