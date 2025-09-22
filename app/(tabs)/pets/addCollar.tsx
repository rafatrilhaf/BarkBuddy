// app/pet/addCollar.tsx
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

export default function AddCollar() {
  const router = useRouter();
  const { petId, petName } = useLocalSearchParams<{ petId: string; petName: string }>();
  
  const [collarCode, setCollarCode] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ Função principal: vincular coleira ao pet
  const vincularColeira = async () => {
    if (!collarCode.trim()) {
      Alert.alert('Erro', 'Digite o código da coleira');
      return;
    }

    const code = collarCode.trim().toUpperCase();
    
    // ✅ Validar formato do código (ex: COL001234567890)
    if (!code.match(/^COL\d{12}$/)) {
      Alert.alert('Código Inválido', 
        'O código deve ter o formato: COL seguido de 12 números\n\n' +
        'Exemplo: COL001234567890'
      );
      return;
    }

    if (!petId) {
      Alert.alert('Erro', 'Pet não identificado');
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
        'Coleira Adicionada!',
        `A coleira ${code} foi vinculada ao ${petName}.\n\n` +
        '⏳ Aguardando confirmação da coleira...\n' +
        '(Pode levar alguns minutos)',
        [{ 
          text: 'OK', 
          onPress: () => router.back()
        }]
      );

    } catch (error) {
      console.error('Erro ao vincular coleira:', error);
      Alert.alert('Erro', 'Não foi possível vincular a coleira. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#006B41" />
          </Pressable>
          <Text style={styles.headerTitle}>Adicionar Coleira</Text>
        </View>

        {/* Pet Info */}
        <View style={styles.petInfo}>
          <Ionicons name="paw" size={32} color="#006B41" />
          <Text style={styles.petName}>{petName}</Text>
          <Text style={styles.petSubtitle}>Vincular coleira inteligente</Text>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>Como vincular:</Text>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>1</Text>
            <Text style={styles.stepText}>Localize o código na embalagem da coleira</Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>2</Text>
            <Text style={styles.stepText}>Digite o código no campo abaixo</Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>3</Text>
            <Text style={styles.stepText}>Ligue a coleira e aguarde a confirmação</Text>
          </View>
        </View>

        {/* Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Código da Coleira</Text>
          <TextInput
            style={styles.input}
            placeholder="COL001234567890"
            value={collarCode}
            onChangeText={setCollarCode}
            maxLength={15}
            autoCapitalize="characters"
            autoCorrect={false}
            autoFocus={true}
          />
          <Text style={styles.inputHint}>
            💡 O código está impresso na embalagem e tem 15 caracteres (COL + 12 números)
          </Text>
        </View>

        {/* Example */}
        <View style={styles.exampleContainer}>
          <Text style={styles.exampleTitle}>Exemplo de código:</Text>
          <View style={styles.exampleCode}>
            <Text style={styles.exampleText}>COL001234567890</Text>
          </View>
        </View>

        {/* Button */}
        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={vincularColeira}
          disabled={loading}
        >
          <Ionicons 
            name={loading ? "hourglass" : "link"} 
            size={20} 
            color="white" 
            style={{ marginRight: 8 }} 
          />
          <Text style={styles.buttonText}>
            {loading ? 'Vinculando...' : 'Vincular Coleira'}
          </Text>
        </Pressable>

        {/* Help */}
        <View style={styles.helpContainer}>
          <Ionicons name="help-circle-outline" size={16} color="#666" />
          <Text style={styles.helpText}>
            Problemas para encontrar o código? Verifique a caixa da coleira ou o manual.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    backgroundColor: '#f0f9ff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#006B41',
  },
  petInfo: {
    alignItems: 'center',
    backgroundColor: '#e8f5ee',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  petName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#006B41',
    marginTop: 8,
  },
  petSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  instructionsContainer: {
    marginBottom: 24,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
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
    backgroundColor: '#006B41',
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 12,
    lineHeight: 24,
    marginRight: 12,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#555',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#006B41',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    fontFamily: 'monospace',
    textAlign: 'center',
    backgroundColor: '#fafafa',
  },
  inputHint: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  exampleContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#006B41',
  },
  exampleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  exampleCode: {
    backgroundColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
  },
  exampleText: {
    fontFamily: 'monospace',
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
  },
  button: {
    backgroundColor: '#006B41',
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
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  helpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  helpText: {
    flex: 1,
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
});
