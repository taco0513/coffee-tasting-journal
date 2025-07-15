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
import { flavorLevel4 } from '../../data/flavorWheel';

const FlavorLevel4Screen = () => {
  const navigation = useNavigation();
  const { selectedFlavors, setFlavorLevel } = useTastingStore();
  const [selectedDescriptors, setSelectedDescriptors] = useState<string[]>(
    selectedFlavors?.level4 || []
  );

  // Group descriptors by their parent level3 item
  const categorizedDescriptors = selectedFlavors.level3.reduce((acc, level3Item) => {
    const descriptors = flavorLevel4[level3Item as keyof typeof flavorLevel4] || [];
    if (descriptors.length > 0) {
      acc[level3Item] = descriptors;
    }
    return acc;
  }, {} as Record<string, string[]>);

  // Check if there are any descriptors available
  const hasDescriptors = Object.keys(categorizedDescriptors).length > 0;

  useEffect(() => {
    // If no descriptors exist, skip to Sensory screen
    if (!hasDescriptors) {
      navigation.navigate('Sensory' as never);
    }
  }, [hasDescriptors, navigation]);

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
    setFlavorLevel(4, selectedDescriptors);
    navigation.navigate('Sensory' as never);
  };

  const handleSkip = () => {
    navigation.navigate('Sensory' as never);
  };

  // Don't render if no descriptors available
  if (!hasDescriptors) {
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
        <View style={styles.progressDot} />
        <View style={[styles.progressDot, styles.activeDot]} />
      </View>

      {/* Title */}
      <Text style={styles.title}>플레이버 선택 (Level 4)</Text>
      <Text style={styles.subtitle}>맛의 특성을 선택하세요 (선택사항)</Text>

      {/* Descriptors by category */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {Object.entries(categorizedDescriptors).map(([category, descriptors]) => (
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
                >
                  <Text
                    style={[
                      styles.descriptorText,
                      selectedDescriptors.includes(descriptor) && styles.selectedText,
                    ]}
                  >
                    {descriptor}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Next Button - Always enabled since selections are optional */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleNext}
      >
        <Text style={styles.buttonText}>
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
  descriptorButton: {
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
  descriptorText: {
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
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default FlavorLevel4Screen;