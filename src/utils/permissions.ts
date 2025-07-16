import { Platform, Linking, Alert } from 'react-native';
import {
  PERMISSIONS,
  RESULTS,
  check,
  request,
  openSettings,
  Permission,
} from 'react-native-permissions';
import { Camera } from 'react-native-vision-camera';

export const CAMERA_PERMISSION = Platform.select({
  ios: PERMISSIONS.IOS.CAMERA,
  android: PERMISSIONS.ANDROID.CAMERA,
}) as Permission;

export type PermissionStatus = 
  | 'unavailable'
  | 'denied'
  | 'limited'
  | 'granted'
  | 'blocked';

interface PermissionResult {
  status: PermissionStatus;
  canAskAgain: boolean;
}

export const checkCameraPermission = async (): Promise<PermissionResult> => {
  try {
    const result = await check(CAMERA_PERMISSION);
    
    console.log('[Permissions] Camera permission check result:', result);
    console.log('[Permissions] Result type:', typeof result);
    console.log('[Permissions] Result === RESULTS.GRANTED:', result === RESULTS.GRANTED);
    console.log('[Permissions] RESULTS constants:', {
      UNAVAILABLE: RESULTS.UNAVAILABLE,
      DENIED: RESULTS.DENIED,
      LIMITED: RESULTS.LIMITED,
      GRANTED: RESULTS.GRANTED,
      BLOCKED: RESULTS.BLOCKED,
    });
    
    // Also log string comparison
    console.log('[Permissions] String comparison - result === "granted":', result === 'granted');
    
    switch (result) {
      case RESULTS.UNAVAILABLE:
        console.log('[Permissions] Camera is unavailable');
        return { status: 'unavailable', canAskAgain: false };
      case RESULTS.DENIED:
        console.log('[Permissions] Camera permission is denied');
        return { status: 'denied', canAskAgain: true };
      case RESULTS.LIMITED:
        console.log('[Permissions] Camera permission is limited');
        return { status: 'limited', canAskAgain: false };
      case RESULTS.GRANTED:
        console.log('[Permissions] Camera permission is granted');
        return { status: 'granted', canAskAgain: false };
      case RESULTS.BLOCKED:
        console.log('[Permissions] Camera permission is blocked');
        return { status: 'blocked', canAskAgain: false };
      default:
        console.log('[Permissions] Unknown permission result:', result);
        return { status: 'denied', canAskAgain: true };
    }
  } catch (error) {
    console.error('[Permissions] Error checking camera permission:', error);
    return { status: 'denied', canAskAgain: true };
  }
};

export const requestCameraPermission = async (): Promise<PermissionResult> => {
  try {
    const result = await request(CAMERA_PERMISSION);
    
    switch (result) {
      case RESULTS.UNAVAILABLE:
        return { status: 'unavailable', canAskAgain: false };
      case RESULTS.DENIED:
        return { status: 'denied', canAskAgain: true };
      case RESULTS.LIMITED:
        return { status: 'limited', canAskAgain: false };
      case RESULTS.GRANTED:
        return { status: 'granted', canAskAgain: false };
      case RESULTS.BLOCKED:
        return { status: 'blocked', canAskAgain: false };
      default:
        return { status: 'denied', canAskAgain: true };
    }
  } catch (error) {
    console.error('Error requesting camera permission:', error);
    return { status: 'denied', canAskAgain: false };
  }
};

export const handleCameraPermission = async (): Promise<boolean> => {
  console.log('[Permissions] ========== Starting handleCameraPermission ==========');
  
  // First check current permission status
  const checkResult = await checkCameraPermission();
  console.log('[Permissions] Check result:', JSON.stringify(checkResult));
  
  // Also try direct check for debugging
  try {
    const directResult = await check(CAMERA_PERMISSION);
    console.log('[Permissions] Direct check result:', directResult);
    console.log('[Permissions] Direct check type:', typeof directResult);
    console.log('[Permissions] Direct check === "granted":', directResult === 'granted');
    console.log('[Permissions] Direct check === RESULTS.GRANTED:', directResult === RESULTS.GRANTED);
    console.log('[Permissions] Direct check === "limited":', directResult === 'limited');
    console.log('[Permissions] Direct check === RESULTS.LIMITED:', directResult === RESULTS.LIMITED);
  } catch (e) {
    console.log('[Permissions] Direct check error:', e);
  }
  
  // Try vision-camera's permission check as fallback
  try {
    const visionCameraStatus = await Camera.getCameraPermissionStatus();
    console.log('[Permissions] Vision Camera permission status:', visionCameraStatus);
    
    if (visionCameraStatus === 'granted' || visionCameraStatus === 'authorized') {
      console.log('[Permissions] ✅ Vision Camera reports permission granted, returning true');
      return true;
    }
    
    // If vision-camera says not authorized but react-native-permissions says something else
    if (visionCameraStatus === 'not-determined' && checkResult.status !== 'granted') {
      console.log('[Permissions] Vision Camera says not-determined, requesting permission');
      const newStatus = await Camera.requestCameraPermission();
      console.log('[Permissions] Vision Camera request result:', newStatus);
      
      if (newStatus === 'granted' || newStatus === 'authorized') {
        console.log('[Permissions] ✅ Vision Camera permission granted after request, returning true');
        return true;
      }
    }
  } catch (e) {
    console.log('[Permissions] Vision Camera permission check error:', e);
  }
  
  if (checkResult.status === 'granted' || checkResult.status === 'limited') {
    // Already granted or limited (iOS), no need to ask
    console.log('[Permissions] ✅ Permission already granted or limited, returning true');
    return true;
  }
  
  if (checkResult.status === 'unavailable') {
    console.log('[Permissions] Camera unavailable on this device');
    Alert.alert(
      '카메라 사용 불가',
      '이 기기에서는 카메라를 사용할 수 없습니다.',
      [{ text: '확인' }]
    );
    return false;
  }
  
  if (checkResult.status === 'blocked' || !checkResult.canAskAgain) {
    // Permission was denied and can't ask again - need to go to settings
    console.log('[Permissions] Permission blocked, showing settings alert');
    Alert.alert(
      '카메라 권한 필요',
      '커피 패키지를 스캔하려면 카메라 권한이 필요합니다. 설정에서 카메라 권한을 허용해주세요.',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '설정으로 이동', 
          onPress: () => openSettings(),
        },
      ]
    );
    return false;
  }
  
  // Permission is denied but we can ask again
  console.log('[Permissions] Requesting permission...');
  const requestResult = await requestCameraPermission();
  console.log('[Permissions] Request result:', requestResult);
  
  if (requestResult.status === 'granted' || requestResult.status === 'limited') {
    console.log('[Permissions] Permission granted or limited after request');
    return true;
  }
  
  if (requestResult.status === 'blocked') {
    // User denied and selected "Don't ask again"
    console.log('[Permissions] Permission blocked after request');
    Alert.alert(
      '카메라 권한 필요',
      '커피 패키지를 스캔하려면 카메라 권한이 필요합니다. 설정에서 카메라 권한을 허용해주세요.',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '설정으로 이동', 
          onPress: () => openSettings(),
        },
      ]
    );
  }
  
  console.log('[Permissions] ❌ Permission not granted, returning false');
  console.log('[Permissions] Final checkResult:', JSON.stringify(checkResult));
  console.log('[Permissions] ========== End handleCameraPermission ==========');
  return false;
};

// Helper function to open app settings directly
export const openAppSettings = () => {
  if (Platform.OS === 'ios') {
    Linking.openURL('app-settings:');
  } else {
    openSettings();
  }
};

// Check if permission is permanently denied
export const isPermissionPermanentlyDenied = async (): Promise<boolean> => {
  const result = await checkCameraPermission();
  return result.status === 'blocked' || (result.status === 'denied' && !result.canAskAgain);
};