// BarkBuddy/app/(tabs)/_layout.tsx - VERSÃO INTERNACIONALIZADA
import { auth } from "@/services/firebase";
import { Ionicons } from "@expo/vector-icons";
import { Tabs, router } from "expo-router";
import { Alert, Text, TouchableOpacity } from "react-native";
import { useLanguage } from "../../contexts/LanguageContext";
import { useTheme } from "../../contexts/ThemeContext";

export default function TabsLayout() {
  const { colors, fontSizes } = useTheme();
  const { t } = useLanguage();

  const logout = () => {
    Alert.alert(
      t('auth.logout'),
      t('auth.logoutConfirm'),
      [
        { text: t('general.cancel'), style: "cancel" },
        {
          text: t('auth.logout'),
          style: "destructive",
          onPress: async () => {
            try {
              await auth.signOut();
              router.replace("/auth/login");
            } catch (e: any) {
              console.error("Erro ao sair:", e.message);
              Alert.alert(t('general.error'), t('auth.logoutError') || "Não foi possível sair. Tente novamente.");
            }
          },
        },
      ]
    );
  };

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.background,
        headerTitleStyle: { 
          fontSize: fontSizes.lg,
          fontWeight: '600'
        },
        tabBarStyle: { 
          backgroundColor: colors.primary, 
          height: 64,
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarActiveTintColor: colors.background,
        tabBarInactiveTintColor: colors.background + '80', // 50% opacity
        tabBarLabelStyle: {
          fontSize: fontSizes.xs,
          fontWeight: '600',
          marginBottom: 4
        }
      }}
    >
      {/* Maps Tab */}
      <Tabs.Screen
        name="maps"
        options={{
          title: t('nav.maps'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map" color={color} size={size} />
          ),
        }}
      />

      {/* Blog Tab */}
      <Tabs.Screen
        name="blog"
        options={{
          title: t('nav.blog'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book" color={color} size={size} />
          ),
        }}
      />

      {/* Tutor Tab */}
      <Tabs.Screen
        name="tutor"
        options={{
          title: t('nav.tutor'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" color={color} size={size} />
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={logout}
              style={{
                marginRight: 12,
                paddingHorizontal: 12,
                paddingVertical: 8,
                backgroundColor: colors.background,
                borderRadius: 8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.2,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              <Text style={{ 
                fontWeight: "600", 
                color: colors.primary,
                fontSize: fontSizes.sm
              }}>
                {t('auth.logout')}
              </Text>
            </TouchableOpacity>
          ),
        }}
      />

      {/* Pets Tab */}
      <Tabs.Screen
        name="pets"
        options={{
          title: t('nav.pets'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="paw" color={color} size={size} />
          ),
          headerShown: false,
        }}
      />

      {/* Agenda Tab */}
      <Tabs.Screen
        name="agenda"
        options={{
          title: t('nav.agenda'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" color={color} size={size} />
          ),
        }}
      />

    
      {/* Settings Tab */}
      <Tabs.Screen
        name="settings"
        options={{
          title: t('nav.settings'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" color={color} size={size} />
          ),
        }}
      />

      {/*
        NÃO incluir mais nenhum <Tabs.Screen name="pet" /> aqui
        para evitar duplicação no rodapé
      */}
    </Tabs>
  );
}