// app/pet/_layout.tsx
import { Stack } from "expo-router";

export default function PetLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="dashboard"
        options={{
          title: "Pet", // <-- deixa o título com "P" maiúsculo
          //headerTitle: () => null, // se quiser remover o título, descomente esta linha
          headerShown: false, // se quiser remover TODO o header, descomente esta linha
        }}
      />

      <Stack.Screen name="edit" options={{ title: "Editar Pet" }} />
      <Stack.Screen name="[id]" options={{ title: "Detalhes do Pet" }} />
      <Stack.Screen name="qrcode" options={{ title: "QR Code do Pet" }} />
    </Stack>
  );
}
