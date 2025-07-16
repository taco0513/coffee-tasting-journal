import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import Toast, { BaseToast, ErrorToast, InfoToast } from 'react-native-toast-message';
import { Colors } from '../constants/colors';

const { width } = Dimensions.get('window');

// iOS HIG 스타일 커스텀 Toast 구성
const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={[
        styles.baseToast,
        {
          borderLeftColor: Colors.SUCCESS_GREEN,
          backgroundColor: '#F1F8E9',
        },
      ]}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
      renderLeadingIcon={() => (
        <View style={styles.iconContainer}>
          <Text style={[styles.icon, { color: Colors.SUCCESS_GREEN }]}>✓</Text>
        </View>
      )}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={[
        styles.baseToast,
        {
          borderLeftColor: Colors.ERROR_RED,
          backgroundColor: '#FFEBEE',
        },
      ]}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
      renderLeadingIcon={() => (
        <View style={styles.iconContainer}>
          <Text style={[styles.icon, { color: Colors.ERROR_RED }]}>✕</Text>
        </View>
      )}
    />
  ),
  info: (props: any) => (
    <InfoToast
      {...props}
      style={[
        styles.baseToast,
        {
          borderLeftColor: Colors.INFO_BLUE,
          backgroundColor: '#E3F2FD',
        },
      ]}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
      renderLeadingIcon={() => (
        <View style={styles.iconContainer}>
          <Text style={[styles.icon, { color: Colors.INFO_BLUE }]}>i</Text>
        </View>
      )}
    />
  ),
};

const styles = StyleSheet.create({
  baseToast: {
    height: 'auto',
    minHeight: 60,
    width: width - 40,
    borderRadius: 12,
    borderLeftWidth: 4,
    paddingHorizontal: 0,
    paddingVertical: 12,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 0,
    flex: 1,
    justifyContent: 'center',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 8,
  },
  icon: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  text1: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 2,
  },
  text2: {
    fontSize: 14,
    fontWeight: '400',
    color: '#757575',
    lineHeight: 18,
  },
});

// Toast 함수들
export const showSuccessToast = (text1: string, text2?: string) => {
  Toast.show({
    type: 'success',
    text1: text1,
    text2: text2,
    position: 'top',
    visibilityTime: 3000,
    autoHide: true,
    topOffset: Platform.OS === 'ios' ? 60 : 40,
  });
};

export const showErrorToast = (text1: string, text2?: string) => {
  Toast.show({
    type: 'error',
    text1: text1,
    text2: text2,
    position: 'top',
    visibilityTime: 4000,
    autoHide: true,
    topOffset: Platform.OS === 'ios' ? 60 : 40,
  });
};

export const showInfoToast = (text1: string, text2?: string) => {
  Toast.show({
    type: 'info',
    text1: text1,
    text2: text2,
    position: 'top',
    visibilityTime: 3000,
    autoHide: true,
    topOffset: Platform.OS === 'ios' ? 60 : 40,
  });
};

// Toast 컴포넌트 (App.tsx에서 사용)
const ToastComponent = () => (
  <Toast config={toastConfig} />
);

export default ToastComponent;