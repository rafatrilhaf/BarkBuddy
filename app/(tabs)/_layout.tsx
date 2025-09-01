import { auth } from "@/services/firebase";
import { Ionicons } from "@expo/vector-icons";
import { Tabs, router } from "expo-router";
import { Text, TouchableOpacity } from "react-native";
import theme from "../../constants/theme";

export default function TabsLayout() {
  const logout = async () => {
    try {
      await auth.signOut();
      router.replace("/auth/login"); // 👈 volta para login
    } catch (e: any) {
      console.error("Erro ao sair:", e.message);
    }
  };

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: theme.green },
        headerTintColor: "#fff",
        tabBarStyle: { backgroundColor: theme.green, height: 64 },
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#c9e3d7",
        headerRight: () => (
          <TouchableOpacity
            onPress={logout}
            style={{
              marginRight: 12,
              paddingHorizontal: 10,
              paddingVertical: 6,
              backgroundColor: "#fff",
              borderRadius: 8,
            }}
          >
            <Text style={{ fontWeight: "600", color: theme.green }}>Sair</Text>
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Localização",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="blog"
        options={{
          title: "Blog",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="paw" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="pet"
        options={{
          title: "Pet",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="medkit" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="tutor"
        options={{
          title: "Tutor",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
