// app/auth/_layout.tsx
import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitle: "",              // não mostra “auth/…”
        headerStyle: { backgroundColor: "#085f37" },
        headerTintColor: "#fff",
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" options={{ title: "Criar conta" }} />
      <Stack.Screen name="forgot-password" options={{ title: "Recuperar senha" }} />
    </Stack>
  );
}
