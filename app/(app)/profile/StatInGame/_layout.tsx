import { Stack, Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function StatInGame() {
    return (
        <><Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack><StatusBar style="light" />
        </>
    );
}