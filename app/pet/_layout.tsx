// app/pet/_layout.tsx
import { Ionicons } from "@expo/vector-icons"; // 👈 ícone da seta
import { router, Stack } from "expo-router";
import { Pressable } from "react-native";

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
         
          title: "",
          headerTitle: "",
          
          // 👇 seta customizada que SEMPRE volta pro tab "pet"
          headerLeft: () => (
            <Pressable
              onPress={() => {
                // tenta voltar; se não houver histórico, cai pro tabs/pet
                try { router.back(); } catch {}
                router.replace("/(tabs)/pet");
              }}
            style={{ paddingHorizontal: 12, paddingVertical: 6 }}
            >
              <Ionicons name="chevron-back" size={24} color="#000" />
                            
            </Pressable>
          ),
        }}
      />
      <Stack.Screen name="edit" options={{ title: "Editar Pet" }} />
      <Stack.Screen name="[id]" options={{ title: "Detalhes do Pet" }} />
      <Stack.Screen name="qrcode" options={{ title: "QR Code do Pet" }} />
    </Stack>
  );
}
