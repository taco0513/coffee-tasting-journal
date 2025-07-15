import React, { useState, useEffect } from 'react';
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
import AutocompleteInput from '../components/AutocompleteInput';
import RealmService from '../services/realm/RealmService';

const CoffeeInfoScreen = () => {
  const navigation = useNavigation();
  
  // Zustand store 사용
  const { currentTasting, updateCoffeeInfo, setCurrentStep } = useTastingStore();
  
  // 자동완성 상태
  const [cafeSuggestions, setCafeSuggestions] = useState<string[]>([]);
  const [roasterSuggestions, setRoasterSuggestions] = useState<string[]>([]);
  const [coffeeNameSuggestions, setCoffeeNameSuggestions] = useState<string[]>([]);
  const [originSuggestions, setOriginSuggestions] = useState<string[]>([]);
  const [varietySuggestions, setVarietySuggestions] = useState<string[]>([]);
  const [processSuggestions, setProcessSuggestions] = useState<string[]>([]);
  const [showCafeSuggestions, setShowCafeSuggestions] = useState(false);
  const [showRoasterSuggestions, setShowRoasterSuggestions] = useState(false);
  
  const realmService = RealmService.getInstance();
  
  // 기본 가공 방식 옵션
  const defaultProcessOptions = ['Washed', 'Natural', 'Honey', 'Anaerobic'];

  // 카페 입력 변경 시 제안 목록 업데이트
  useEffect(() => {
    if (currentTasting.cafeName && currentTasting.cafeName.trim().length > 0) {
      const suggestions = realmService.getCafeSuggestions(currentTasting.cafeName);
      setCafeSuggestions(suggestions.map(cafe => cafe.name));
    } else {
      setCafeSuggestions([]);
    }
  }, [currentTasting.cafeName]);
  
  // 로스터 입력 변경 시 제안 목록 업데이트 (카페 기반)
  useEffect(() => {
    if (currentTasting.cafeName) {
      // If cafe is selected, show roasters from that cafe
      const suggestions = realmService.getCafeRoasters(
        currentTasting.cafeName,
        currentTasting.roastery
      );
      setRoasterSuggestions(suggestions);
    } else if (currentTasting.roastery && currentTasting.roastery.trim().length > 0) {
      // If no cafe selected, show all roaster suggestions
      const suggestions = realmService.getRoasterSuggestions(currentTasting.roastery);
      setRoasterSuggestions(suggestions.map(roaster => roaster.name));
    } else {
      setRoasterSuggestions([]);
    }
  }, [currentTasting.roastery, currentTasting.cafeName]);
  
  // 커피 이름 입력 변경 시 제안 목록 업데이트 (로스터리 기반)
  useEffect(() => {
    if (currentTasting.roastery) {
      // If roastery is selected, show only coffees from that roastery
      const suggestions = realmService.getRoasterCoffees(
        currentTasting.roastery, 
        currentTasting.coffeeName
      );
      setCoffeeNameSuggestions(suggestions);
    } else if (currentTasting.coffeeName && currentTasting.coffeeName.trim().length > 0) {
      // If no roastery selected, show all coffee suggestions
      const suggestions = realmService.getCoffeeNameSuggestions(currentTasting.coffeeName);
      setCoffeeNameSuggestions(suggestions);
    } else {
      setCoffeeNameSuggestions([]);
    }
  }, [currentTasting.coffeeName, currentTasting.roastery]);
  
  // 생산지 입력 변경 시 제안 목록 업데이트
  useEffect(() => {
    if (currentTasting.origin && currentTasting.origin.trim().length > 0) {
      const suggestions = realmService.getOriginSuggestions(currentTasting.origin);
      setOriginSuggestions(suggestions);
    } else {
      setOriginSuggestions([]);
    }
  }, [currentTasting.origin]);
  
  // 품종 입력 변경 시 제안 목록 업데이트
  useEffect(() => {
    if (currentTasting.variety && currentTasting.variety.trim().length > 0) {
      const suggestions = realmService.getVarietySuggestions(currentTasting.variety);
      setVarietySuggestions(suggestions);
    } else {
      setVarietySuggestions([]);
    }
  }, [currentTasting.variety]);
  
  // 가공 방식 입력 변경 시 제안 목록 업데이트
  useEffect(() => {
    if (currentTasting.process && currentTasting.process.trim().length > 0) {
      // Filter default options based on input
      const filtered = defaultProcessOptions.filter(option => 
        option.toLowerCase().startsWith(currentTasting.process.toLowerCase())
      );
      // Also add previously used process methods from RealmService
      const previousProcesses = realmService.getProcessSuggestions(currentTasting.process);
      
      // Combine and remove duplicates
      const combined = [...new Set([...filtered, ...previousProcesses])];
      setProcessSuggestions(combined.slice(0, 10));
    } else {
      setProcessSuggestions(defaultProcessOptions);
    }
  }, [currentTasting.process]);
  
  // 필수 필드가 채워졌는지 확인
  const isValid = currentTasting.roastery && currentTasting.coffeeName;

  const handleNext = () => {
    if (isValid) {
      // 방문 횟수 증가
      if (currentTasting.cafeName && currentTasting.cafeName.trim().length > 0) {
        realmService.incrementCafeVisit(currentTasting.cafeName);
      }
      if (currentTasting.roastery && currentTasting.roastery.trim().length > 0) {
        realmService.incrementRoasterVisit(currentTasting.roastery);
      }
      
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
            <View style={{ zIndex: cafeSuggestions.length > 0 && currentTasting.cafeName ? 10 : 1 }}>
              <AutocompleteInput
                value={currentTasting.cafeName || ''}
                onChangeText={(text) => updateCoffeeInfo({cafeName: text})}
                onSelect={(item) => {
                  // Update cafe name
                  updateCoffeeInfo({cafeName: item});
                  
                  // Check if there's a roastery with the same name
                  const roastersWithSameName = realmService.getRoasterSuggestions(item);
                  if (roastersWithSameName.length > 0 && 
                      roastersWithSameName.some(r => r.name === item) &&
                      !currentTasting.roastery) {
                    // Auto-fill roastery if cafe name matches a roastery name
                    updateCoffeeInfo({cafeName: item, roastery: item});
                  }
                }}
                suggestions={cafeSuggestions}
                placeholder="예: 블루보틀"
                label="카페 이름 (선택)"
              />
            </View>

            {/* 로스터리 (필수) */}
            <View style={{ zIndex: roasterSuggestions.length > 0 && currentTasting.roastery ? 5 : 1 }}>
              <AutocompleteInput
                value={currentTasting.roastery || ''}
                onChangeText={(text) => updateCoffeeInfo({roastery: text})}
                onSelect={(item) => updateCoffeeInfo({roastery: item})}
                suggestions={roasterSuggestions}
                placeholder="예: 프릳츠"
                label="로스터리 *"
              />
            </View>

            {/* 커피 이름 (필수) */}
            <View style={{ zIndex: coffeeNameSuggestions.length > 0 && currentTasting.coffeeName ? 4 : 1 }}>
              <AutocompleteInput
                value={currentTasting.coffeeName || ''}
                onChangeText={(text) => updateCoffeeInfo({coffeeName: text})}
                onSelect={(item) => {
                  // Update coffee name
                  updateCoffeeInfo({coffeeName: item});
                  
                  // Auto-fill other fields if we have previous data
                  if (currentTasting.roastery) {
                    const details = realmService.getCoffeeDetails(currentTasting.roastery, item);
                    if (details) {
                      updateCoffeeInfo({
                        coffeeName: item,
                        origin: details.origin || currentTasting.origin || '',
                        variety: details.variety || currentTasting.variety || '',
                        altitude: details.altitude || currentTasting.altitude || '',
                        process: details.process || currentTasting.process || '',
                        roasterNotes: details.roasterNotes || currentTasting.roasterNotes || '',
                      });
                    }
                  }
                }}
                suggestions={coffeeNameSuggestions}
                placeholder="예: 에티오피아 예가체프 G1"
                label="커피 이름 *"
              />
            </View>

            {/* 생산지 (선택) */}
            <View style={{ zIndex: originSuggestions.length > 0 && currentTasting.origin ? 3 : 1 }}>
              <AutocompleteInput
                value={currentTasting.origin || ''}
                onChangeText={(text) => updateCoffeeInfo({origin: text})}
                onSelect={(item) => updateCoffeeInfo({origin: item})}
                suggestions={originSuggestions}
                placeholder="예: Ethiopia / Yirgacheffe"
                label="생산지 (선택)"
              />
            </View>

            {/* 품종 (선택) */}
            <View style={{ zIndex: varietySuggestions.length > 0 && currentTasting.variety ? 2 : 1 }}>
              <AutocompleteInput
                value={currentTasting.variety || ''}
                onChangeText={(text) => updateCoffeeInfo({variety: text})}
                onSelect={(item) => updateCoffeeInfo({variety: item})}
                suggestions={varietySuggestions}
                placeholder="예: Heirloom"
                label="품종 (선택)"
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
            <View style={{ zIndex: processSuggestions.length > 0 && currentTasting.process ? 1 : 1 }}>
              <AutocompleteInput
                value={currentTasting.process || ''}
                onChangeText={(text) => updateCoffeeInfo({process: text})}
                onSelect={(item) => updateCoffeeInfo({process: item})}
                suggestions={processSuggestions}
                placeholder="예: Washed"
                label="가공 방식 (선택)"
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