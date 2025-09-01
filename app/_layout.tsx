// app/_layout.tsx
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#085f37" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "700" },
        }}
      >
        {/* splash/index - raiz do app */}
        <Stack.Screen name="index" options={{ title: "Início" }} />

        {/* grupo das abas */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* auth group */}
        <Stack.Screen name="auth" options={{ headerShown: false }} />

        {/* telas extras */}
        <Stack.Screen name="about" options={{ title: "Sobre" }} />
        <Stack.Screen name="pet/[petId]" options={{ title: "Pet" }} />
      </Stack>
    </>
  );
}
