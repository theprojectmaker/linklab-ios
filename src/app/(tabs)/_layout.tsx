import { Tabs } from 'expo-router';
import { Text } from 'react-native';

function TabIcon({ symbol, color }: { symbol: string; color: unknown }) {
  return <Text style={{ fontSize: 18, color: color as string }}>{symbol}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: '#0B1220' },
        headerTintColor: '#E6F0FF',
        tabBarStyle: { backgroundColor: '#0B1220', borderTopColor: '#1C2A3F' },
        tabBarActiveTintColor: '#4FD1C5',
        tabBarInactiveTintColor: '#5A6B85',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Run', tabBarIcon: ({ color }) => <TabIcon symbol="▶" color={color} /> }}
      />
      <Tabs.Screen
        name="results"
        options={{ title: 'Results', tabBarIcon: ({ color }) => <TabIcon symbol="▤" color={color} /> }}
      />
      <Tabs.Screen
        name="history"
        options={{ title: 'History', tabBarIcon: ({ color }) => <TabIcon symbol="⏱" color={color} /> }}
      />
      <Tabs.Screen
        name="about"
        options={{ title: 'About', tabBarIcon: ({ color }) => <TabIcon symbol="ℹ" color={color} /> }}
      />
    </Tabs>
  );
}
