// app/_layout.tsx
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from '../contexts/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="about" options={{ title: "Sobre" }} />
        <Stack.Screen name="pet/[Id]" options={{ title: "Pet" }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </AuthProvider>
  );
}
