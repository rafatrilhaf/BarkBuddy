// app/(tabs)/_layout.tsx - VERSÃO COM FALLBACK SEGURO

import { auth } from "@/services/firebase";
import { Ionicons } from "@expo/vector-icons";
import { Tabs, router } from "expo-router";
import { Alert, Text, TouchableOpacity } from "react-native";
import { useLanguage } from "../../contexts/LanguageContext";
import { useTheme } from "../../contexts/ThemeContext";

export default function TabsLayout() {
  const { colors, fontSizes, isDark } = useTheme();
  const { t } = useLanguage();

  // ✅ Função para obter cores da Tab Bar com fallback seguro
  const getTabBarColors = () => ({
    background: isDark ? (colors.tabBarBackground || '#0a2818') : colors.primary,
    active: isDark ? (colors.tabBarActive || '#4ade80') : colors.background,
    inactive: isDark ? (colors.tabBarInactive || '#9ca3af') : colors.background + '80',
  });

  const tabBarColors = getTabBarColors();

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
        headerStyle: {
          backgroundColor: colors.primary,
        },
        // HeaderTintColor aplica a ícones e botão de voltar
        // Garante título sempre branco
        headerTitleStyle: {
          fontSize:   fontSizes.lg,
          fontWeight: '600',
          color:      colors.white,
        },
        tabBarStyle: { 
          backgroundColor: tabBarColors.background, // ← Usando fallback seguro
          height: 64,
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarActiveTintColor: tabBarColors.active, // ← Usando fallback seguro
        tabBarInactiveTintColor: tabBarColors.inactive, // ← Usando fallback seguro
        tabBarLabelStyle: {
          fontSize: fontSizes.xs,
          fontWeight: '600',
          marginBottom: 4
        }
      }}
    >
      {/* Resto das tabs igual... */}
      <Tabs.Screen
        name="maps"
        options={{
          title: t('nav.maps'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="blog"
        options={{
          title: t('nav.blog'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book" color={color} size={size} />
          ),
        }}
      />

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

      <Tabs.Screen
        name="agenda"
        options={{
          title: t('nav.agenda'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: t('nav.settings'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
