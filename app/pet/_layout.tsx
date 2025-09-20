// app/pet/_layout.tsx
import { Stack } from "expo-router";

export default function PetLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "",
        headerBackTitleVisible: false,
        headerLargeTitle: false,
        tabBarIcon: false,
      }}
    >
      <Stack.Screen
        name="dashboard"
        options={{
          // ✅ SOLUÇÃO: Desabilitar completamente o header do dashboard
          headerShown: false,
        }}
      />
      <Stack.Screen name="edit" options={{ title: "Editar Pet" }} />
      <Stack.Screen name="[id]" options={{ title: "Detalhes do Pet" }} />
      <Stack.Screen name="qrcode" options={{ title: "QR Code do Pet" }} />
    </Stack>
  );
}
