import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ScanProvider } from '../lib/scanStore';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ScanProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="run/[id]" options={{ headerShown: true, title: 'Run details' }} />
        </Stack>
      </ScanProvider>
    </SafeAreaProvider>
  );
}
