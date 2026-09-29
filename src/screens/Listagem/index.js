import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import api from '../../api/api';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';

const RACAS = ['shinigami', 'humans', 'quincy', 'arrancar'];

const RACA_LABEL = {
  shinigami: 'Shinigami',
  humans: 'Humano',
  quincy: 'Quincy',
  arrancar: 'Arrancar',
};

const RACA_COLOR = {
  shinigami: '#2c3e50',
  humans: '#e67e22',
  quincy: '#3498db',
  arrancar: '#8e44ad',
};

/** Normaliza um nome para o formato de slug esperado pela API. */
function gerarSlug(nome) {
  return nome
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // remove acentos
    .replace(/['’]/g, ' ')             // apóstrofos viram espaço
    .replace(/[^a-zA-Z0-9\s]/g, '')    // remove outros símbolos
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-');             // espaços -> hífen
}

export function ListagemScreen() {
  const navigation = useNavigation();
  const [personagens, setPersonagens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    async function fetchTodos() {
      try {
        setLoading(true);
        setErro(null);

        const respostas = await Promise.all(
          RACAS.map((raca) => fetch(`${API_URL}/characters/${raca}`))
        );

        respostas.forEach((r) => {
          if (!r.ok) throw new Error(`Erro ${r.status}`);
        });

        const dados = await Promise.all(respostas.map((r) => r.json()));

        const lista = [];
        dados.forEach((dado, idx) => {
          const raca = RACAS[idx];
          const nomes = dado[raca] || [];
          nomes.forEach((nome) => {
            lista.push({
              id: `${raca}-${nome}`,
              nome,
              raca,
              slugDetalhe: gerarSlug(nome).replace(/-/g, '_'),
              slugAvatar: gerarSlug(nome),
            });
          });
        });

        setPersonagens(lista);
      } catch (err) {
        console.error(err);
        setErro('Não foi possível carregar os personagens. Tente novamente.');
        setPersonagens([]);
      } finally {
        setLoading(false);
      }
    }

    fetchTodos();
  }, []);

  const abrirDetalhes = (item) => {
    navigation.navigate('Detalhes', {
      race: item.raca,
      name: item.nome,
      slug: item.slugDetalhe,
    });
  };

  const renderItem = ({ item }) => {
    const avatarUrl = `${baseURL}/avatar/${item.raca}/${encodeURIComponent(item.slugAvatar)}`;

    const iniciais = item.nome
      .split(' ')
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => abrirDetalhes(item)}
      >
        <View style={styles.avatarWrapper}>
          <Image
            source={{ uri: avatarUrl }}
            style={styles.avatar}
            resizeMode="cover"
          />
          <View style={styles.avatarFallback} pointerEvents="none">
            <Text style={styles.avatarFallbackText}>{iniciais}</Text>
          </View>
        </View>

        <View style={styles.cardInfo}>
          <Text style={styles.cardNome} numberOfLines={1}>
            {item.nome}
          </Text>

          <View
            style={[
              styles.badge,
              { backgroundColor: RACA_COLOR[item.raca] || '#888' },
            ]}
          >
            <Text style={styles.badgeText}>{RACA_LABEL[item.raca]}</Text>
          </View>
        </View>

        <Text style={styles.cardArrow}>›</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Carregando personagens...</Text>
          <Text style={styles.loadingHint}>
            A primeira requisição pode levar até 1 minuto.
          </Text>
        </View>
      ) : erro ? (
        <View style={styles.center}>
          <Text style={styles.erroText}>{erro}</Text>
        </View>
      ) : (
        <FlatList
          data={personagens}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.erroText}>Nenhum personagem encontrado.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

export default ListagemScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContent: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  avatarWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
  },
  avatarFallback: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#d0d0d0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFallbackText: {
    color: '#555',
    fontWeight: '700',
    fontSize: 18,
  },
  cardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cardNome: {
    fontSize: 15,
    color: '#2c3e50',
    fontWeight: '600',
    marginBottom: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  cardArrow: {
    fontSize: 22,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#7f8c8d',
  },
  loadingHint: {
    marginTop: 6,
    fontSize: 12,
    color: '#b0b0b0',
    textAlign: 'center',
  },
  erroText: {
    fontSize: 15,
    color: '#c0392b',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});