import { Stack, Tabs } from 'expo-router';

export default function ProfileTabsLayout() {
  return (
    <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="StatInGame" options={{ headerShown: false }} />
        <Stack.Screen name="UserEdit" options={{ headerShown: false }} />
        <Stack.Screen name="utilisateurs" options={{ headerShown: false }} />
  </Stack>
  );
}