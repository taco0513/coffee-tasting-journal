import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTastingStore} from '../stores/tastingStore';

const CoffeeInfoScreen = () => {
  const navigation = useNavigation();
  
  // Zustand store 사용
  const { currentTasting, updateCoffeeInfo, setCurrentStep } = useTastingStore();

  // 필수 필드가 채워졌는지 확인
  const isValid = currentTasting.roastery && currentTasting.coffeeName;

  const handleNext = () => {
    if (isValid) {
      // 다음 단계로 이동
      setCurrentStep(2);
      navigation.navigate('RoasterNotes' as never);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={{flexGrow: 1}}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled">
          {/* 진행 상태 바 */}
          <View style={styles.progressBar}>
            <View style={styles.progressStep}>
              <View style={[styles.progressDot, styles.activeDot]} />
              <Text style={styles.progressText}>커피 정보</Text>
            </View>
            <View style={styles.progressLine} />
            <View style={styles.progressStep}>
              <View style={styles.progressDot} />
              <Text style={styles.progressText}>컵 노트</Text>
            </View>
            <View style={styles.progressLine} />
            <View style={styles.progressStep}>
              <View style={styles.progressDot} />
              <Text style={styles.progressText}>맛</Text>
            </View>
          </View>

          {/* 입력 폼 */}
          <View style={styles.form}>
            {/* 카페 이름 (선택) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>카페 이름 (선택)</Text>
              <TextInput
                style={styles.input}
                placeholder="예: 블루보틀"
                value={currentTasting.cafeName}
                onChangeText={(text) => 
                  updateCoffeeInfo({cafeName: text})
                }
              />
            </View>

            {/* 로스터리 (필수) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                로스터리 <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="예: 프릳츠"
                value={currentTasting.roastery}
                onChangeText={(text) => 
                  updateCoffeeInfo({roastery: text})
                }
              />
            </View>

            {/* 커피 이름 (필수) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                커피 이름 <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="예: 에티오피아 예가체프 G1"
                value={currentTasting.coffeeName}
                onChangeText={(text) => 
                  updateCoffeeInfo({coffeeName: text})
                }
              />
            </View>

            {/* 생산지 (선택) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>생산지 (선택)</Text>
              <TextInput
                style={styles.input}
                placeholder="예: Ethiopia / Yirgacheffe"
                value={currentTasting.origin}
                onChangeText={(text) => 
                  updateCoffeeInfo({origin: text})
                }
              />
            </View>

            {/* 품종 (선택) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>품종 (선택)</Text>
              <TextInput
                style={styles.input}
                placeholder="예: Heirloom"
                value={currentTasting.variety}
                onChangeText={(text) => 
                  updateCoffeeInfo({variety: text})
                }
              />
            </View>

            {/* 고도 (선택) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>고도 (선택)</Text>
              <TextInput
                style={styles.input}
                placeholder="예: 1,800-2,000m"
                value={currentTasting.altitude}
                onChangeText={(text) => 
                  updateCoffeeInfo({altitude: text})
                }
              />
            </View>

            {/* 가공 방식 (선택) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>가공 방식 (선택)</Text>
              <TextInput
                style={styles.input}
                placeholder="예: Washed"
                value={currentTasting.process}
                onChangeText={(text) => 
                  updateCoffeeInfo({process: text})
                }
              />
            </View>

            {/* 온도 선택 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>온도</Text>
              <View style={styles.temperatureButtons}>
                <TouchableOpacity
                  style={[
                    styles.tempButton,
                    currentTasting.temperature === 'hot' && styles.tempButtonActive,
                  ]}
                  onPress={() => 
                    updateCoffeeInfo({temperature: 'hot'})
                  }>
                  <Text
                    style={[
                      styles.tempButtonText,
                      currentTasting.temperature === 'hot' && styles.tempButtonTextActive,
                    ]}>
                    ☕ Hot
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.tempButton,
                    currentTasting.temperature === 'ice' && styles.tempButtonActive,
                  ]}
                  onPress={() => 
                    updateCoffeeInfo({temperature: 'ice'})
                  }>
                  <Text
                    style={[
                      styles.tempButtonText,
                      currentTasting.temperature === 'ice' && styles.tempButtonTextActive,
                    ]}>
                    🧊 Ice
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* 다음 버튼 */}
          <View style={styles.bottomContainer}>
            <TouchableOpacity
              style={[styles.nextButton, !isValid && styles.nextButtonDisabled]}
              onPress={handleNext}
              disabled={!isValid}>
              <Text style={styles.nextButtonText}>다음</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  progressStep: {
    alignItems: 'center',
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E0E0E0',
    marginBottom: 4,
  },
  activeDot: {
    backgroundColor: '#000000',
  },
  progressText: {
    fontSize: 12,
    color: '#666666',
  },
  progressLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 10,
    marginBottom: 20,
  },
  form: {
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  required: {
    color: '#FF0000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  temperatureButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  tempButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  tempButtonActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  tempButtonText: {
    fontSize: 16,
    color: '#666666',
  },
  tempButtonTextActive: {
    color: '#FFFFFF',
  },
  bottomContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  nextButton: {
    backgroundColor: '#000000',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default CoffeeInfoScreen;