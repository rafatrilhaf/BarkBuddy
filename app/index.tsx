import { Link, router } from 'expo-router';
import { Image, Pressable, Text, View } from 'react-native';

export default function Splash() {
  return (
    <View style={{ flex: 1, backgroundColor: '#085f37', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      {/* LOGO (já existe no seu projeto como assets/images/Logo.png) */}
      <Image
        source={require('../assets/images/Logo.png')}
        style={{ width: 160, height: 160, marginBottom: 16 }}
        resizeMode="contain"
      />

      <Image source={require('../assets/images/Wordmark.png')} style={{ width: 260, height: 56, marginBottom: 24 }} resizeMode="contain" />
      
      <Pressable
    
        onPress={() => router.push('/auth/login')}
        style={{ backgroundColor: '#ececec', borderRadius: 16, padding: 14, width: '100%', marginBottom: 12 }}
      >
        <Text style={{ textAlign: 'center', fontWeight: '900', color: '#0e3b28', fontSize: 22 }}>
          Sou dono de pet
        </Text>
      </Pressable>


      <Link href="https://barktestsofi.netlify.app" asChild>
        <Pressable style={{ borderWidth: 2, borderColor: '#ececec', borderRadius: 16, padding: 14, width: '100%' }}>
          <Text style={{ textAlign: 'center', fontWeight: '900', color: '#fff', fontSize: 22 }}>Conhecer o BarkBuddy</Text>
        </Pressable>
      </Link>
    </View>
  );
}
