import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export function HomeScreen() {
  const navigation = useNavigation();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="auto" />

      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.title}>Bleach API</Text>
        <Text style={styles.subtitle}>Explore o universo de Bleach</Text>
      </View>

      {/* Descrição */}
      <View style={styles.descriptionContainer}>
        <Text style={styles.description}>
          A Bleach API é uma API REST abrangente inspirada no icônico anime e mangá Bleach.
          Ela concede acesso a um extenso banco de dados com centenas de personagens,
          imagens (avatares), transformações e informações detalhadas do universo Bleach.
        </Text>
        <Text style={styles.description}>
          Com ela, você pode obter informações como nome (em inglês, kanji e romaji),
          descrição, raça, aniversário, gênero, altura, peso, afiliação, Zanpakutō,
          aparições no mangá e anime, dubladores japoneses e ingleses, além de citações marcantes.
        </Text>
      </View>

      {/* Recursos em destaque */}
      <View style={styles.featuresContainer}>
        <Text style={styles.featuresTitle}>O que você encontra:</Text>
        <Text style={styles.featureItem}>• Personagens divididos por raça: Shinigami, Humanos, Quincy e Arrancar</Text>
        <Text style={styles.featureItem}>• Estatísticas detalhadas: altura, peso, aniversário e gênero</Text>
        <Text style={styles.featureItem}>• Zanpakutō e status profissional (afiliação, time, parceiro)</Text>
        <Text style={styles.featureItem}>• Avatares dos personagens em PNG</Text>
      </View>

      {/* Botão principal para listagem */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Listagem')}
      >
        <Text style={styles.buttonText}>Ver Personagens</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#34495e',
    marginBottom: 12,
    textAlign: 'justify',
  },
  featuresContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 10,
  },
  featureItem: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});