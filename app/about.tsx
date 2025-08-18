import { Button, Linking, View } from "react-native";

export default function About() {
  return (
    <View style={{ flex:1, justifyContent:"center", gap:12, padding:24 }}>
      <Button title="Sobre os produtores" onPress={() => Linking.openURL("https://seu-site/sobre")} />
      <Button title="Atendimento" onPress={() => Linking.openURL("https://seu-site/atendimento")} />
      <Button title="Perguntas frequentes" onPress={() => Linking.openURL("https://seu-site/faq")} />
    </View>
  );
}
