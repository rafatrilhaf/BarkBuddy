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
        {/* aqui fica só UM Stack.Screen para o grupo de abas */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* outras telas normais */}
        <Stack.Screen name="about" options={{ title: "Sobre" }} />
        <Stack.Screen name="pet/[petId]" options={{ title: "Pet" }} />
      </Stack>
    </>
  );
}
