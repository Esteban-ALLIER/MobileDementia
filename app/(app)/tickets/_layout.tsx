import { Stack, Tabs } from 'expo-router';

export default function TicketsTabsLayout() {
  return (
    <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
  </Stack>
  );
}