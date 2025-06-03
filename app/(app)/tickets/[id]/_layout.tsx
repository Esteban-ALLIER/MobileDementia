import { Stack, Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function TicketDetailsLayout() {
  return (
    <><Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="comments" options={{ headerShown: false }} />
    </Stack><StatusBar style="light" />
    </>
  );
}