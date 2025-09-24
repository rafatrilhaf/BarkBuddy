// app/(tabs)/pets/_layout.tsx

import { Stack } from "expo-router";
import { ThemeProvider, useTheme } from "../../../contexts/ThemeContext";

function PetsStack() {
  const { colors, fontSizes } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerBackTitleVisible: true,
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.white,
        headerTitleStyle: {
          fontSize: fontSizes.md,
          fontWeight: "600",
          color: colors.white,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: "Pet", headerShown: true }}
      />
      <Stack.Screen
        name="dashboard"
        options={{ title: "Dashboards", headerShown: true }}
      />
      <Stack.Screen
        name="addCollar"
        options={{ title: "Adicionar Coleira" }}
      />
      <Stack.Screen
        name="edit"
        options={{ title: "Editar Pet" }}
      />
      <Stack.Screen
        name="[id]"
        options={{ title: "Detalhes do Pet" }}
      />
      <Stack.Screen
        name="qrcode"
        options={{ title: "QR Code do Pet" }}
      />
    </Stack>
  );
}

export default function PetsLayout() {
  return (
    <ThemeProvider>
      <PetsStack />
    </ThemeProvider>
  );
}
