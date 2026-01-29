import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import App from './src/components/App';

export default function AppWrapper() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <App />
    </GestureHandlerRootView>
  );
}

