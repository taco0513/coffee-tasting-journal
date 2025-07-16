import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Camera, useCameraDevices, useFrameProcessor } from 'react-native-vision-camera';
import OCRService, { ParsedCoffeeInfo } from '../services/OCRService';
import { Colors } from '../constants/colors';
import { handleCameraPermission, openAppSettings } from '../utils/permissions';

interface CameraModalProps {
  visible: boolean;
  onClose: () => void;
  onTextRecognized: (info: ParsedCoffeeInfo) => void;
}

const { width, height } = Dimensions.get('window');

const CameraModal: React.FC<CameraModalProps> = ({ visible, onClose, onTextRecognized }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const cameraRef = useRef<Camera>(null);
  const devices = useCameraDevices();
  const device = devices.back;

  useEffect(() => {
    if (visible) {
      initializeCamera();
    } else {
      setIsActive(false);
    }
  }, [visible]);

  const initializeCamera = async () => {
    console.log('[CameraModal] Initializing camera...');
    const permissionGranted = await handleCameraPermission();
    console.log('[CameraModal] Permission granted:', permissionGranted);
    setHasPermission(permissionGranted);
    if (permissionGranted) {
      console.log('[CameraModal] Activating camera');
      setIsActive(true);
    } else {
      console.log('[CameraModal] Camera permission denied');
    }
  };

  const takePhoto = async () => {
    if (!cameraRef.current || isProcessing) return;

    setIsProcessing(true);
    try {
      const photo = await cameraRef.current.takePhoto({
        quality: 90,
        skipMetadata: true,
      });

      // Process the image with OCR
      const ocrService = OCRService.getInstance();
      const result = await ocrService.recognizeText(photo.path);
      
      if (result.text) {
        const parsedInfo = ocrService.parseCoffeeInfo(result.text);
        const validatedInfo = ocrService.validateExtractedInfo(parsedInfo);
        
        // Show success message
        Alert.alert(
          '텍스트 인식 완료',
          '커피 정보를 성공적으로 추출했습니다.',
          [
            {
              text: '확인',
              onPress: () => {
                onTextRecognized(validatedInfo);
                onClose();
              },
            },
          ]
        );
      } else {
        Alert.alert(
          '텍스트 인식 실패',
          '이미지에서 텍스트를 인식할 수 없습니다. 다시 시도해주세요.',
          [{ text: '확인' }]
        );
      }
    } catch (error) {
      console.error('Photo capture error:', error);
      Alert.alert(
        '사진 촬영 실패',
        '사진을 촬영할 수 없습니다. 다시 시도해주세요.',
        [{ text: '확인' }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      onClose();
    }
  };

  if (!visible) return null;

  if (hasPermission === null) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.PRIMARY} />
          <Text style={styles.loadingText}>카메라 권한을 확인하는 중...</Text>
        </View>
      </Modal>
    );
  }

  if (hasPermission === false) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>
            카메라 권한이 필요합니다.
          </Text>
          <Text style={styles.permissionSubText}>
            커피 패키지를 스캔하려면 카메라 권한을 허용해주세요.
          </Text>
          <View style={styles.permissionButtonContainer}>
            <TouchableOpacity 
              style={[styles.closeButton, styles.settingsButton]} 
              onPress={openAppSettings}
            >
              <Text style={styles.closeButtonText}>설정으로 이동</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.closeButton, styles.cancelButton]} 
              onPress={handleClose}
            >
              <Text style={[styles.closeButtonText, styles.cancelButtonText]}>취소</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  if (!device) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            카메라를 찾을 수 없습니다.
          </Text>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeButtonText}>닫기</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide">
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>커피 패키지 스캔</Text>
          <TouchableOpacity
            style={styles.closeIcon}
            onPress={handleClose}
            disabled={isProcessing}
          >
            <Text style={styles.closeIconText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cameraContainer}>
          <Camera
            ref={cameraRef}
            style={styles.camera}
            device={device}
            isActive={isActive}
            photo={true}
            video={false}
            audio={false}
          />
          
          {/* Overlay guide */}
          <View style={styles.overlay}>
            <View style={styles.guideFrame} />
            <Text style={styles.guideText}>
              커피 패키지의 라벨을 프레임 안에 맞춰주세요
            </Text>
          </View>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.captureButton, isProcessing && styles.captureButtonDisabled]}
            onPress={takePhoto}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.captureButtonText}>촬영</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.instructions}>
          <Text style={styles.instructionTitle}>사용 방법:</Text>
          <Text style={styles.instructionText}>
            • 커피 패키지의 라벨이 선명하게 보이도록 촬영하세요
          </Text>
          <Text style={styles.instructionText}>
            • 조명이 충분한 곳에서 촬영하세요
          </Text>
          <Text style={styles.instructionText}>
            • 라벨의 텍스트가 흐리지 않도록 주의하세요
          </Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  closeIcon: {
    padding: 5,
  },
  closeIconText: {
    fontSize: 20,
    color: '#fff',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideFrame: {
    width: width * 0.8,
    height: height * 0.4,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  guideText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  instructions: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 5,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 20,
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 40,
  },
  permissionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  permissionSubText: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 30,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
  },
  permissionButtonContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 20,
  },
  closeButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsButton: {
    backgroundColor: Colors.PRIMARY,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#ccc',
  },
});

export default CameraModal;