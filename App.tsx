import React from 'react';
import { StatusBar, SafeAreaView, StyleSheet } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import ToastComponent from './src/components/Toast';
import { ToastProvider } from './src/components/common';

function App(): React.JSX.Element {
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