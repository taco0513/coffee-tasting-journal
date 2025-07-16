import React, { useEffect } from 'react';
import { StatusBar, SafeAreaView, StyleSheet } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import ToastComponent from './src/components/Toast';
import { ToastProvider } from './src/components/common';
import { authUtils } from './src/services/supabase/auth';

function App(): React.JSX.Element {
  useEffect(() => {
    // 앱 시작 시 인증 초기화
    const initializeAuth = async () => {
      try {
        console.log('Initializing authentication...');
        await authUtils.initialize();
        console.log('Authentication initialized successfully');
      } catch (error) {
        console.error('Failed to initialize authentication:', error);
      }
    };

    initializeAuth();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <AppNavigator />
      <ToastComponent />
      <ToastProvider />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;