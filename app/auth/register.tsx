import { Link, router } from "expo-router";
import { useState } from "react";
import { Alert, Button, TextInput, View } from "react-native";
import { signUp } from "../../services/auth";

export default function RegisterScreen() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cep, setCep] = useState("");
  const [senha, setSenha] = useState("");

  async function handleRegister() {
    try {
      await signUp(email.trim(), senha);
      router.replace("/(tabs)/map");
    } catch (e: any) {
      Alert.alert("Erro ao cadastrar", e?.message ?? "Tente novamente");
    }
  }

  return (
    <View style={{ flex:1, gap:12, padding:20, justifyContent:"center" }}>
      <TextInput placeholder="Nome completo" value={nome} onChangeText={setNome} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
      <TextInput placeholder="Telefone" value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" />
      <TextInput placeholder="CEP" value={cep} onChangeText={setCep} keyboardType="numeric" />
      <TextInput placeholder="Senha" value={senha} onChangeText={setSenha} secureTextEntry />
      <Button title="Criar cadastro" onPress={handleRegister} />
      <Link href="/auth/login">Já tem um login? Clique aqui</Link>
    </View>
  );
}
