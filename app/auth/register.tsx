import { Link, router } from 'expo-router';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

// Input reutilizável com tipagem correta
type FormInputProps = { label: string } & TextInputProps;
function FormInput({ label, ...props }: FormInputProps) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ color: '#fff', marginBottom: 6 }}>{label}</Text>
      <TextInput
        style={{ backgroundColor: '#ececec', borderRadius: 14, padding: 12 }}
        placeholder={label}
        placeholderTextColor="#666"
        {...props}
      />
    </View>
  );
}

export default function Register() {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#085f37' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1, padding: 20 }}>
          {/* LOGO topo */}
          <View style={{ alignItems: 'center', marginTop: 48, marginBottom: 16 }}>
            <Image
              source={require('../../assets/images/Logo.png')} // caminho a partir de app/auth/
              style={{ width: 120, height: 120 }}
              resizeMode="contain"
            />
          </View>

          {/* Wordmark (opcional) */}
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <Image
              source={require('../../assets/images/Wordmark.png')}
              style={{ width: 200, height: 40 }}
              resizeMode="contain"
            />
          </View>

          {/* Campos */}
          <FormInput label="Nome Completo" />
          <FormInput label="Email" keyboardType="email-address" autoCapitalize="none" />
          <FormInput label="Telefone" keyboardType="phone-pad" />
          <FormInput label="CEP" keyboardType="number-pad" maxLength={9} />
          <FormInput label="Senha" secureTextEntry />

          {/* Botão Criar (mesma cor do Login) */}
          <Pressable
            onPress={() => router.replace('./(tabs)')}
            style={({ pressed }) => ({
              marginTop: 8,
              backgroundColor: pressed ? '#c6d8cd' : '#d3e3d9',
              borderRadius: 16,
              paddingVertical: 16,
            })}
          >
            <Text style={{ textAlign: 'center', fontWeight: '800', color: '#0e3b28', fontSize: 22, lineHeight: 26 }}>
              Criar
            </Text>
          </Pressable>

          {/* Voltar para login */}
          <Link href="/auth/login" asChild>
            <Pressable>
              <Text style={{ color: '#dfeee6', textAlign: 'center', marginTop: 8 }}>
                Já tem um login? Clique aqui
              </Text>
            </Pressable>
          </Link>
        </View>

        {/* Barra inferior com marca */}
        <View
          style={{
            backgroundColor: '#1b6d49',
            paddingVertical: 14,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900' }}>BarkBuddy</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
