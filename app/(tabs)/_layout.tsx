// BarkBuddy/app/(tabs)/_layout.tsx
import { auth } from "@/services/firebase";
import { Ionicons } from "@expo/vector-icons";
import { Tabs, router } from "expo-router";
import { Alert, Text, TouchableOpacity } from "react-native";
import theme from "../../constants/theme";

export default function TabsLayout() {
  const logout = () => {
    Alert.alert(
      "Sair da conta",
      "Deseja realmente sair da sua conta?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sair",
          style: "destructive",
          onPress: async () => {
            try {
              await auth.signOut();
              router.replace("/auth/login");
            } catch (e: any) {
              console.error("Erro ao sair:", e.message);
              Alert.alert("Erro", "Não foi possível sair. Tente novamente.");
            }
          },
        },
      ]
    );
  };

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: theme.green },
        headerTintColor: "#fff",
        tabBarStyle: { backgroundColor: theme.green, height: 64 },
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#c9e3d7",
      }}
    >
      <Tabs.Screen
        name="maps"
        options={{
          title: "Maps",
          tabBarIcon: ({ color, size }) => <Ionicons name="map" color={color} size={size} />,
        }}
      />

      <Tabs.Screen
        name="blog"
        options={{
          title: "Blog",
          tabBarIcon: ({ color, size }) => <Ionicons name="book" color={color} size={size} />,
        }}
      />

      <Tabs.Screen
        name="tutor"
        options={{
          title: "Tutor",
          tabBarIcon: ({ color, size }) => <Ionicons name="person" color={color} size={size} />,
          headerRight: () => (
            <TouchableOpacity
              onPress={logout}
              style={{
                marginRight: 12,
                paddingHorizontal: 10,
                paddingVertical: 6,
                backgroundColor: "#fff",
                borderRadius: 8,
                opacity: 0.9,
              }}
            >
              <Text style={{ fontWeight: "600", color: theme.green }}>Sair</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <Tabs.Screen
        name="pets"
        options={{
          title: "Pet",
          tabBarIcon: ({ color, size }) => <Ionicons name="paw" color={color} size={size} />,
          headerShown: false,
        }}
      />

      {/* Aqui adicionamos a nova aba Agenda */}
      <Tabs.Screen
        name="agenda"
        options={{
          title: "Agenda",
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar" color={color} size={size} />,
        }}
      />

      <Tabs.Screen
        name="about"
        options={{
          title: "Sobre",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="information-circle" color={color} size={size} />
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={logout}
              style={{
                marginRight: 12,
                paddingHorizontal: 10,
                paddingVertical: 6,
                backgroundColor: "#fff",
                borderRadius: 8,
                opacity: 0.9,
              }}
            >
              <Text style={{ fontWeight: "600", color: theme.green }}>Sair</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Ajustes",
          tabBarIcon: ({ color, size }) => <Ionicons name="settings" color={color} size={size} />,
        }}
      />

      {/*
        NÃO incluir mais nenhum <Tabs.Screen name="pet" /> aqui
        para evitar duplicação no rodapé
      */}
    </Tabs>
  );
}
