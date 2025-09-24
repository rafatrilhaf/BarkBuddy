// app/pet/addCollar.tsx - VERSÃO INTERNACIONALIZADA
import { db } from '@/services/firebase';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useTheme } from '../../../contexts/ThemeContext';

// Função para substituir placeholders nas strings de tradução
function replacePlaceholders(text: string, placeholders: { [key: string]: string }): string {
  let result = text;
  Object.keys(placeholders).forEach(key => {
    result = result.replace(`{${key}}`, placeholders[key]);
  });
  return result;
}

export default function AddCollar() {
  const { colors, fontSizes } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();
  const { petId, petName } = useLocalSearchParams<{ petId: string; petName: string }>();
  
  const [collarCode, setCollarCode] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ Função principal: vincular coleira ao pet - INTERNACIONALIZADA
  const vincularColeira = async () => {
    if (!collarCode.trim()) {
      Alert.alert(t('general.error'), t('collar.enterCode'));
      return;
    }

    const code = collarCode.trim().toUpperCase();
    
    // ✅ Validar formato do código (ex: COL001234567890)
    if (!code.match(/^COL\d{12}$/)) {
      Alert.alert(
        t('collar.invalidCode'), 
        t('collar.invalidCodeDesc')
      );
      return;
    }

    if (!petId) {
      Alert.alert(t('general.error'), t('collar.petNotFound'));
      return;
    }

    setLoading(true);

    try {
      // ✅ 1. Registrar comando de pairing no Firebase (CORRIGIDO)
      // Envolver petId em objeto para evitar erro do Firebase
      await setDoc(doc(db, 'collarPairing', code), { petId });

      // ✅ 2. Registrar coleira no pet (para referência)
      await updateDoc(doc(db, 'pets', petId), {
        collarId: code,
        collarLinkedAt: serverTimestamp(),
        isCollarActive: false, // Será true quando coleira confirmar
      });

      Alert.alert(
        t('collar.collarAdded'),
        replacePlaceholders(t('collar.collarAddedDesc'), { 
          code, 
          petName: petName || '' 
        }),
        [{ 
          text: t('button.ok'), 
          onPress: () => router.back()
        }]
      );

    } catch (error) {
      console.error('Erro ao vincular coleira:', error);
      Alert.alert(t('general.error'), t('collar.linkError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header - INTERNACIONALIZADO */}
        {/*<View style={styles.header}>
          <Pressable onPress={() => router.back()} style={[styles.backButton, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </Pressable>
          <Text style={[styles.headerTitle, { 
            color: colors.primary,
            fontSize: fontSizes.xl
          }]}>
            {t('collar.title')}
          </Text>
        </View>*/}

        {/* Pet Info - INTERNACIONALIZADO */}
        <View style={[styles.petInfo, { backgroundColor: colors.primary + '15' }]}>
          <Ionicons name="paw" size={32} color={colors.primary} />
          <Text style={[styles.petName, { 
            color: colors.primary,
            fontSize: fontSizes.xxl
          }]}>
            {petName}
          </Text>
          <Text style={[styles.petSubtitle, { 
            color: colors.textSecondary,
            fontSize: fontSizes.sm
          }]}>
            {t('collar.linkSmartCollar')}
          </Text>
        </View>

        {/* Instructions - INTERNACIONALIZADAS */}
        <View style={styles.instructionsContainer}>
          <Text style={[styles.instructionsTitle, { 
            color: colors.text,
            fontSize: fontSizes.lg
          }]}>
            {t('collar.howToLink')}
          </Text>
          
          <View style={styles.step}>
            <Text style={[styles.stepNumber, { backgroundColor: colors.primary }]}>1</Text>
            <Text style={[styles.stepText, { 
              color: colors.textSecondary,
              fontSize: fontSizes.md
            }]}>
              {t('collar.step1')}
            </Text>
          </View>
          
          <View style={styles.step}>
            <Text style={[styles.stepNumber, { backgroundColor: colors.primary }]}>2</Text>
            <Text style={[styles.stepText, { 
              color: colors.textSecondary,
              fontSize: fontSizes.md
            }]}>
              {t('collar.step2')}
            </Text>
          </View>
          
          <View style={styles.step}>
            <Text style={[styles.stepNumber, { backgroundColor: colors.primary }]}>3</Text>
            <Text style={[styles.stepText, { 
              color: colors.textSecondary,
              fontSize: fontSizes.md
            }]}>
              {t('collar.step3')}
            </Text>
          </View>
        </View>

        {/* Input - INTERNACIONALIZADO */}
        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { 
            color: colors.text,
            fontSize: fontSizes.lg
          }]}>
            {t('collar.collarCode')}
          </Text>
          <TextInput
            style={[styles.input, { 
              borderColor: colors.primary,
              backgroundColor: colors.surface,
              color: colors.text,
              fontSize: fontSizes.lg
            }]}
            placeholder={t('collar.codePlaceholder')}
            placeholderTextColor={colors.textSecondary}
            value={collarCode}
            onChangeText={setCollarCode}
            maxLength={15}
            autoCapitalize="characters"
            autoCorrect={false}
            autoFocus={true}
          />
          <Text style={[styles.inputHint, { 
            color: colors.textTertiary,
            fontSize: fontSizes.xs
          }]}>
            {t('collar.codeHint')}
          </Text>
        </View>

        {/* Example - INTERNACIONALIZADO */}
        <View style={[styles.exampleContainer, { 
          backgroundColor: colors.surface,
          borderLeftColor: colors.primary
        }]}>
          <Text style={[styles.exampleTitle, { 
            color: colors.textSecondary,
            fontSize: fontSizes.md
          }]}>
            {t('collar.exampleCode')}
          </Text>
          <View style={[styles.exampleCode, { backgroundColor: colors.background }]}>
            <Text style={[styles.exampleText, { 
              color: colors.text,
              fontSize: fontSizes.lg
            }]}>
              COL001234567890
            </Text>
          </View>
        </View>

        {/* Button - INTERNACIONALIZADO */}
        <Pressable
          style={[
            styles.button, 
            { backgroundColor: colors.primary },
            loading && styles.buttonDisabled
          ]}
          onPress={vincularColeira}
          disabled={loading}
        >
          <Ionicons 
            name={loading ? "hourglass" : "link"} 
            size={20} 
            color={colors.background}
            style={{ marginRight: 8 }} 
          />
          <Text style={[styles.buttonText, { 
            color: colors.background,
            fontSize: fontSizes.lg
          }]}>
            {loading ? t('collar.linking') : t('collar.linkCollar')}
          </Text>
        </Pressable>

        {/* Help - INTERNACIONALIZADO */}
        <View style={[styles.helpContainer, { backgroundColor: colors.surface }]}>
          <Ionicons name="help-circle-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.helpText, { 
            color: colors.textSecondary,
            fontSize: fontSizes.xs
          }]}>
            {t('collar.helpText')}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 20, // Espaço extra para status bar
  },
  backButton: {
    padding: 8,
    marginRight: 12,
    borderRadius: 8,
  },
  headerTitle: {
    fontWeight: 'bold',
  },
  petInfo: {
    alignItems: 'center',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  petName: {
    fontWeight: 'bold',
    marginTop: 8,
  },
  petSubtitle: {
    marginTop: 4,
  },
  instructionsContainer: {
    marginBottom: 24,
  },
  instructionsTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 12,
    lineHeight: 24,
    marginRight: 12,
  },
  stepText: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  inputHint: {
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  exampleContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
  },
  exampleTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  exampleCode: {
    borderRadius: 8,
    padding: 12,
  },
  exampleText: {
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  button: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontWeight: 'bold',
  },
  helpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  helpText: {
    flex: 1,
    marginLeft: 8,
  },
});