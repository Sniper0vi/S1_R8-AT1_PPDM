import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      {/* Botão para navegar para página de categorias */}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('CategoriaScreen')}>
        <Text style={styles.text}>Categorias</Text>
      </TouchableOpacity>

      {/* Botão para navegar para página de produtos */}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ProdutoScreen')}>
        <Text style={styles.text}>Produtos</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    width: '95%',
    marginBottom: 10
  },
  text: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
