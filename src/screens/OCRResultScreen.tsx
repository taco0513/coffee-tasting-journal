import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

const OCRResultScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { parsedInfo, rawTexts } = route.params;
  
  // 수정 가능한 상태로 관리
  const [editedInfo, setEditedInfo] = useState({
    roastery: parsedInfo.roastery || '',
    coffeeName: parsedInfo.coffeeName || '',
    origin: parsedInfo.origin || '',
    variety: parsedInfo.variety || '',
    process: parsedInfo.process || '',
    roasterNotes: parsedInfo.roasterNotes || '',
  });
  
  const handleConfirm = () => {
    // 수정된 데이터를 CoffeeInfo 화면으로 전달
    navigation.navigate('CoffeeInfo', {
      scannedData: editedInfo
    });
  };
  
  const handleRetake = () => {
    // 다시 스캔 화면으로
    navigation.goBack();
  };
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>OCR 결과 확인</Text>
      <Text style={styles.subtitle}>인식된 텍스트를 확인하고 수정해주세요</Text>
      
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>로스터리</Text>
        <TextInput
          style={styles.input}
          value={editedInfo.roastery}
          onChangeText={(text) => setEditedInfo({...editedInfo, roastery: text})}
          placeholder="예: STEREOSCOPE"
        />
      </View>
      
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>커피 이름</Text>
        <TextInput
          style={styles.input}
          value={editedInfo.coffeeName}
          onChangeText={(text) => setEditedInfo({...editedInfo, coffeeName: text})}
          placeholder="예: Uteuzi Jimbo-Nyeri"
        />
      </View>
      
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>원산지</Text>
        <TextInput
          style={styles.input}
          value={editedInfo.origin}
          onChangeText={(text) => setEditedInfo({...editedInfo, origin: text})}
          placeholder="예: KENYA / Nyeri"
        />
      </View>
      
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>품종</Text>
        <TextInput
          style={styles.input}
          value={editedInfo.variety}
          onChangeText={(text) => setEditedInfo({...editedInfo, variety: text})}
          placeholder="예: SL28, SL34"
        />
      </View>
      
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>가공방식</Text>
        <TextInput
          style={styles.input}
          value={editedInfo.process}
          onChangeText={(text) => setEditedInfo({...editedInfo, process: text})}
          placeholder="예: Washed"
        />
      </View>
      
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>컵노트</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          value={editedInfo.roasterNotes}
          onChangeText={(text) => setEditedInfo({...editedInfo, roasterNotes: text})}
          placeholder="예: Pink Pineapple, Passionfruit"
          multiline
          numberOfLines={3}
        />
      </View>
      
      <View style={styles.rawTextContainer}>
        <Text style={styles.rawTextTitle}>원본 텍스트:</Text>
        <Text style={styles.rawText}>{rawTexts.join('\n')}</Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.retakeButton} onPress={handleRetake}>
          <Text style={styles.retakeButtonText}>다시 스캔</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>확인</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  fieldContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  rawTextContainer: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 20,
  },
  rawTextTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  rawText: {
    fontSize: 12,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  retakeButton: {
    flex: 1,
    backgroundColor: '#666',
    padding: 15,
    borderRadius: 8,
    marginRight: 10,
  },
  retakeButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginLeft: 10,
  },
  confirmButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OCRResultScreen;