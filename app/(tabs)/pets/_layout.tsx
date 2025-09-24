// BarkBuddy/app/(tabs)/pets/_layout.tsx
import { Stack } from "expo-router";
import theme from "../../../constants/theme";

export default function PetsLayout() {
  return (
    <Stack
      screenOptions={{
        //headerBackTitle: "Voltar",
        headerBackTitleVisible: true,
        headerTintColor: "#fff",
        headerStyle: { backgroundColor: theme.green }, // Mesmo verde do header das tabs
      }}
    >
      <Stack.Screen
        name="index"
        options={{ 
          title: "Pet", 
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="dashboard"
        options={{ 
          title: "Dashboards", 
          headerShown: true,
        }}
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
