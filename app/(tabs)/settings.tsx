import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';

interface SettingItemProps {
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  showArrow?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({
  title,
  subtitle,
  icon,
  onPress,
  showArrow = true,
}) => {
  const { colors, fontSizes } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.settingItem,
        {
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
        },
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: colors.primary + '20' },
          ]}
        >
          <Ionicons name={icon} size={22} color={colors.primary} />
        </View>
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.settingTitle,
              { 
                color: colors.text,
                fontSize: fontSizes.md,
                fontWeight: '600',
              },
            ]}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              style={[
                styles.settingSubtitle,
                { 
                  color: colors.textSecondary,
                  fontSize: fontSizes.sm,
                },
              ]}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {showArrow && onPress && (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={colors.textSecondary}
        />
      )}
    </TouchableOpacity>
  );
};

const SectionHeader: React.FC<{ title: string }> = ({ title }) => {
  const { colors, fontSizes } = useTheme();

  return (
    <Text
      style={[
        styles.sectionHeader,
        {
          color: colors.textSecondary,
          fontSize: fontSizes.sm,
        },
      ]}
    >
      {title.toUpperCase()}
    </Text>
  );
};

export default function SettingsScreen() {
  const { themeMode, setThemeMode, fontSize, setFontSize, colors, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const handleThemePress = () => {
    Alert.alert(
      t('settings.theme'),
      'Escolha um tema:',
      [
        {
          text: t('theme.light'),
          onPress: () => setThemeMode('light'),
        },
        {
          text: t('theme.dark'),
          onPress: () => setThemeMode('dark'),
        },
        {
          text: t('theme.system'),
          onPress: () => setThemeMode('system'),
        },
        {
          text: t('general.cancel'),
          style: 'cancel',
        },
      ]
    );
  };

  const handleLanguagePress = () => {
    Alert.alert(
      t('settings.language'),
      'Escolha um idioma:',
      [
        {
          text: 'Português',
          onPress: () => setLanguage('pt'),
        },
        {
          text: 'English',
          onPress: () => setLanguage('en'),
        },
        {
          text: 'Español',
          onPress: () => setLanguage('es'),
        },
        {
          text: t('general.cancel'),
          style: 'cancel',
        },
      ]
    );
  };

  const handleFontSizePress = () => {
    Alert.alert(
      t('settings.fontSize'),
      'Escolha o tamanho:',
      [
        {
          text: t('fontSize.small'),
          onPress: () => setFontSize('small'),
        },
        {
          text: t('fontSize.medium'),
          onPress: () => setFontSize('medium'),
        },
        {
          text: t('fontSize.large'),
          onPress: () => setFontSize('large'),
        },
        {
          text: t('general.cancel'),
          style: 'cancel',
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      t('auth.logout'),
      t('auth.logoutConfirm'),
      [
        {
          text: t('button.no'),
          style: 'cancel',
        },
        {
          text: t('button.yes'),
          style: 'destructive',
          onPress: () => {
            console.log('Logout realizado');
          },
        },
      ]
    );
  };

  const getThemeText = () => {
    switch (themeMode) {
      case 'light': return t('theme.light');
      case 'dark': return t('theme.dark');
      case 'system': return t('theme.system');
      default: return t('theme.system');
    }
  };

  const getLanguageText = () => {
    switch (language) {
      case 'pt': return 'Português';
      case 'en': return 'English';
      case 'es': return 'Español';
      default: return 'Português';
    }
  };

  const getFontSizeText = () => {
    switch (fontSize) {
      case 'small': return t('fontSize.small');
      case 'medium': return t('fontSize.medium');
      case 'large': return t('fontSize.large');
      default: return t('fontSize.medium');
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Aparência */}
        <SectionHeader title={t('settings.appearance')} />
        <View style={styles.section}>
          <SettingItem
            title={t('settings.theme')}
            subtitle={getThemeText()}
            icon="color-palette-outline"
            onPress={handleThemePress}
          />
          <SettingItem
            title={t('settings.language')}
            subtitle={getLanguageText()}
            icon="language-outline"
            onPress={handleLanguagePress}
          />
        </View>

        {/* Acessibilidade */}
        <SectionHeader title={t('settings.accessibility')} />
        <View style={styles.section}>
          <SettingItem
            title={t('settings.fontSize')}
            subtitle={getFontSizeText()}
            icon="text-outline"
            onPress={handleFontSizePress}
          />
        </View>

        {/* Conta */}
        <SectionHeader title={t('settings.account')} />
        <View style={styles.section}>
          <SettingItem
            title="Perfil"
            subtitle="Editar perfil"
            icon="person-outline"
            onPress={() => console.log('Abrir perfil')}
          />
          <SettingItem
            title="Notificações"
            subtitle="Gerenciar notificações"
            icon="notifications-outline"
            onPress={() => console.log('Abrir notificações')}
          />
        </View>

        {/* Suporte */}
        <SectionHeader title={t('settings.support')} />
        <View style={styles.section}>
          <SettingItem
            title={t('settings.help')}
            subtitle="Central de ajuda"
            icon="help-circle-outline"
            onPress={() => console.log('Abrir ajuda')}
          />
          <SettingItem
            title={t('settings.about')}
            subtitle="Versão 1.0.0"
            icon="information-circle-outline"
            onPress={() => console.log('Sobre o app')}
          />
        </View>

        {/* Logout */}
        <View style={[styles.section, { marginTop: 20 }]}>
          <SettingItem
            title={t('auth.logout')}
            subtitle="Sair da sua conta"
            icon="log-out-outline"
            onPress={handleLogout}
            showArrow={false}
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 20,
  },
  sectionHeader: {
    fontWeight: '600',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  section: {
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  settingTitle: {
    marginBottom: 2,
  },
  settingSubtitle: {
    opacity: 0.8,
  },
});
