import { Stack } from "expo-router";

export default function AuthLayout() {
    return (
        <Stack>
            <Stack.Screen name="login" options={{ title: "Se connecter" }} />
            <Stack.Screen name="register" options={{ title: "S'enregistrer" }} />
        </Stack>
    )
}