import { Link, Tabs } from "expo-router";
import { Pressable, Text } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerTitleAlign: "center" }}>
      <Tabs.Screen name="map"   options={{ title: "Localização" }} />
      <Tabs.Screen name="blog"  options={{ title: "Blog" }} />
      <Tabs.Screen name="lost"  options={{ title: "Perdidos" }} />
      <Tabs.Screen name="pet"   options={{ title: "Meu Pet" }} />
      <Tabs.Screen
        name="tutor"
        options={{
          title: "Tutor",
          headerRight: () => (
            <Link href="/about" asChild>
              <Pressable style={{ paddingRight: 12 }}><Text>Sobre</Text></Pressable>
            </Link>
          ),
        }}
      />
    </Tabs>
  );
}
