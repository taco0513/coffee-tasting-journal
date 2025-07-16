import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Camera, useCameraDevices, getCameraDevice } from 'react-native-vision-camera';
import { recognizeText } from '../utils/ocr.ios';
import { parseOCRResult } from '../utils/ocrParser';

const OCRScanScreen = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(false);
  const camera = useRef(null);
  const devices = useCameraDevices();
  
  // getCameraDevice를 사용해서 후면 카메라 가져오기
  const device = getCameraDevice(devices, 'back');

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleScan = async () => {
    try {
      if (camera.current) {
        const photo = await camera.current.takePhoto({ flash: 'off' });
        console.log('사진 촬영 완료');
        
        // OCR 처리
        const texts = await recognizeText(photo.path);
        console.log('인식된 텍스트:', texts);
        
        // 텍스트 파싱
        const parsedInfo = parseOCRResult(texts);
        console.log('파싱된 정보:', parsedInfo);
        
        // 결과를 OCRResult 화면으로 전달
        navigation.navigate('OCRResult', {
          parsedInfo: parsedInfo,
          rawTexts: texts
        });
      }
    } catch (error) {
      console.error('스캔 에러:', error);
      Alert.alert('오류', '텍스트 인식에 실패했습니다.');
    }
  };

  if (!hasPermission) {
    return <Text>카메라 권한이 필요합니다</Text>;
  }

  // device가 없으면 로딩 표시
  if (!device) {
    return (
      <View style={styles.container}>
        <Text>카메라 로딩 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
      />
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.scanButton}
          onPress={handleScan}
        >
          <Text style={styles.buttonText}>스캔</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>닫기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  scanButton: {
    backgroundColor: 'blue',
    padding: 15,
    borderRadius: 10,
  },
  closeButton: {
    backgroundColor: 'red',
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default OCRScanScreen;