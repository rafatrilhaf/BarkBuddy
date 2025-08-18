import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="auth/login" options={{ title: "Entrar" }} />
      <Stack.Screen name="auth/register" options={{ title: "Criar conta" }} />
      <Stack.Screen name="auth/forgot-password" options={{ title: "Recuperar senha" }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="about" options={{ title: "Sobre" }} />
    </Stack>
  );
}
