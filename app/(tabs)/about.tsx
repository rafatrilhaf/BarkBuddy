// app/(tabs)/about.tsx
import { Alert, ImageBackground, Linking, Pressable, Text, View } from "react-native";
import theme from "../../constants/theme";

function open(url: string) {
  Linking.openURL(url).catch(() =>
    Alert.alert("Não foi possível abrir o link.", url)
  );
}

export default function About() {
  return (
    <ImageBackground
      source={{ uri: "https://i.ibb.co/0fhv5yw/bg-patas.png" }} // pode trocar para uma imagem sua
      style={{ flex: 1, padding: 24 }}
      imageStyle={{ opacity: 0.1 }} // deixa a imagem discreta
    >
      <View style={{ flex: 1, justifyContent: "center", gap: 16 }}>
        {[
          { title: "Sobre os produtores", url: "https://barkbuddyofficial.netlify.app/#produtores" },
          { title: "Atendimento", url: "https://barkbuddyofficial.netlify.app/#contato" },
          { title: "Perguntas frequentes", url: "https://barkbuddyofficial.netlify.app/#faq" },
        ].map((item) => (
          <Pressable
            key={item.url}
            onPress={() => open(item.url)}
            style={{
              backgroundColor: theme.green,
              paddingVertical: 14,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
              {item.title}
            </Text>
          </Pressable>
        ))}
      </View>
    </ImageBackground>
  );
}
