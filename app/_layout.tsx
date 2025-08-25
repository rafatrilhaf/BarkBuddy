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
        {/* As telas abaixo são resolvidas automaticamente por nome de arquivo */}
        <Stack.Screen name="index" options={{ title: "BarkBuddy" }} />
        <Stack.Screen name="about" options={{ title: "Sobre" }} />
        <Stack.Screen name="pet/[petId]" options={{ title: "Pet" }} />
      </Stack>
    </>
  );
}