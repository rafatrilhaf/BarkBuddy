// app/about.tsx
import { Alert, Button, Linking, View } from "react-native";

function open(url: string) {
  Linking.openURL(url).catch(() =>
    Alert.alert("Não foi possível abrir o link.", url)
  );
}

export default function About() {
  return (
    <View style={{ flex: 1, justifyContent: "center", gap: 12, padding: 24 }}>
      <Button
        title="Sobre os produtores"
        onPress={() => open("https://barkbuddyofficial.netlify.app/#produtores")}
      />
      <Button
        title="Atendimento"
        onPress={() => open("https://barkbuddyofficial.netlify.app/#contato")}
      />
      <Button
        title="Perguntas frequentes"
        onPress={() => open("https://barkbuddyofficial.netlify.app/#faq")}
      />
    </View>
  );
}
