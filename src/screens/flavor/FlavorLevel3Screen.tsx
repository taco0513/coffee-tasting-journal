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
import { flavorLevel3 } from '../../data/flavorWheel';

const FlavorLevel3Screen = () => {
  const navigation = useNavigation();
  const { selectedFlavors, setFlavorLevel } = useTastingStore();
  const [selectedLevel3, setSelectedLevel3] = useState<string[]>(
    selectedFlavors?.level3 || []
  );

  // Group level3 options by their parent level2 category
  const categorizedLevel3 = selectedFlavors.level2.reduce((acc, level2Item) => {
    const level3Options = flavorLevel3[level2Item as keyof typeof flavorLevel3] || [];
    if (level3Options.length > 0) {
      acc[level2Item] = level3Options;
    }
    return acc;
  }, {} as Record<string, string[]>);

  // Check if there are any level3 options available
  const hasLevel3Options = Object.keys(categorizedLevel3).length > 0;

  useEffect(() => {
    // If no level3 options exist, skip to Sensory screen
    if (!hasLevel3Options) {
      navigation.navigate('Sensory' as never);
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
    setFlavorLevel(3, selectedLevel3);
    navigation.navigate('FlavorLevel4' as never);
  };

  const handleSkip = () => {
    navigation.navigate('Sensory' as never);
  };

  const isNextEnabled = selectedLevel3.length > 0;

  // Don't render if no options available
  if (!hasLevel3Options) {
    return null;
  }

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
                >
                  <Text
                    style={[
                      styles.itemText,
                      selectedLevel3.includes(item) && styles.selectedText,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
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
  itemButton: {
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
  itemText: {
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

export default FlavorLevel3Screen;