import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRoute } from '@react-navigation/native';

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

/* Normaliza qualquer valor que deveria ser uma URL em string */
function normalizarUrl(valor) {
  if (!valor) return null;

  // Caso 1: já é string
  if (typeof valor === 'string') {
    return valor.startsWith('http') ? valor : null;
  }

  // Caso 2: é array — pega o primeiro item válido
  if (Array.isArray(valor)) {
    for (const item of valor) {
      const url = normalizarUrl(item);
      if (url) return url;
    }
    return null;
  }

  // Caso 3: é objeto com .url ou .source ou .src
  if (typeof valor === 'object') {
    return normalizarUrl(valor.url || valor.source || valor.src);
  }

  return null;
}

export function DetalhesScreen() {
  const route = useRoute();
  const { race, name, slug } = route.params || {};

  const [personagem, setPersonagem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    async function fetchPersonagem() {
      try {
        setLoading(true);
        setErro(null);

        const response = await fetch(`${API_URL}/characters/${race}/${slug}`);
        if (!response.ok) throw new Error(`Erro ${response.status}`);

        const data = await response.json();
        const resultado = data.results?.[0] || data.results || null;

        // Log de debug — remova depois de confirmar que está tudo ok
        if (resultado) {
          console.log('avatar:', resultado.avatar, typeof resultado.avatar);
          console.log('media:', resultado.media);
        }

        setPersonagem(resultado);
      } catch (err) {
        console.error(err);
        setErro('Não foi possível carregar os dados do personagem.');
      } finally {
        setLoading(false);
      }
    }

    if (race && slug) fetchPersonagem();
  }, [race, slug]);

  if (loading) {
    return (
      <View style={styles.center}>
        <StatusBar style="auto" />
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Carregando personagem...</Text>
      </View>
    );
  }

  if (erro || !personagem) {
    return (
      <View style={styles.center}>
        <StatusBar style="auto" />
        <Text style={styles.erroText}>
          {erro || 'Personagem não encontrado.'}
        </Text>
      </View>
    );
  }

  const stats = personagem.stats || {};
  const prof = stats.ProfessionalStatus || {};
  const zan = stats.Zanpakutō || {};
  const first = stats.FirstAppearance || {};
  const voices = stats.Voices || {};

  // Monta a URL do avatar com fallback para o endpoint /avatar/{race}/{slug}
  const slugAvatar = slug ? slug.replace(/_/g, '-') : '';

  const avatarFromApi = normalizarUrl(personagem.avatar);
  const avatarUrl =
    avatarFromApi ||
    (slugAvatar ? `${API_URL}/avatar/${race}/${slugAvatar}` : null);

  // Filtra mídias válidas — normaliza cada source para string ou descarta
  const midiasValidas = (personagem.media || [])
    .map((m) => {
      if (!m) return null;
      const url = normalizarUrl(m.source || m);
      if (!url) return null;
      return { url, alt: typeof m.alt === 'string' ? m.alt : '' };
    })
    .filter(Boolean);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StatusBar style="auto" />

      {/* Cabeçalho: avatar + nomes + badge de raça */}
      <View style={styles.header}>
        <ImagemAvatar uri={avatarUrl} />

        <Text style={styles.nome}>{personagem.name?.english || name}</Text>

        {personagem.name?.kanji ? (
          <Text style={styles.kanji}>{personagem.name.kanji}</Text>
        ) : null}

        {personagem.name?.romaji ? (
          <Text style={styles.romaji}>{personagem.name.romaji}</Text>
        ) : null}

        {stats.race ? (
          <View
            style={[
              styles.badge,
              { backgroundColor: RACA_COLOR[race] || '#888' },
            ]}
          >
            <Text style={styles.badgeText}>
              {RACA_LABEL[race] || stats.race}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Descrição */}
      {personagem.description ? (
        <Secao titulo="Descrição">
          <Text style={styles.texto}>{personagem.description}</Text>
        </Secao>
      ) : null}

      {/* Estatísticas básicas */}
      <Secao titulo="Informações">
        <Linha label="Raça" valor={stats.race} />
        <Linha label="Aniversário" valor={stats.birthday} />
        <Linha label="Gênero" valor={stats.gender} />
        <Linha label="Altura" valor={stats.height} />
        <Linha label="Peso" valor={stats.weight} />
      </Secao>

      {/* Status profissional */}
      {prof.previous_affiliation ||
      prof.previous_occupation ||
      prof.previous_team ||
      prof.partner ||
      (prof.base_of_operations && prof.base_of_operations.length) ? (
        <Secao titulo="Status Profissional">
          <Linha label="Afiliação anterior" valor={prof.previous_affiliation} />
          <Linha label="Ocupação anterior" valor={prof.previous_occupation} />
          <Linha label="Time anterior" valor={prof.previous_team} />
          <Linha label="Parceiro" valor={prof.partner} />
          {prof.base_of_operations && prof.base_of_operations.length > 0 ? (
            <Linha
              label="Base de operações"
              valor={prof.base_of_operations.join(', ')}
            />
          ) : null}
        </Secao>
      ) : null}

      {/* Zanpakutō */}
      {zan.resurrección ? (
        <Secao titulo="Zanpakutō">
          <Linha label="Resurreição" valor={zan.resurrección} />
        </Secao>
      ) : null}

      {/* Primeira aparição */}
      {first.manga || first.anime ? (
        <Secao titulo="Primeira Aparição">
          <Linha label="Mangá" valor={first.manga} />
          <Linha label="Anime" valor={first.anime} />
        </Secao>
      ) : null}

      {/* Dubladores */}
      {voices.japanese || voices.english ? (
        <Secao titulo="Vozes">
          <Linha label="Japonês" valor={voices.japanese} />
          <Linha label="Inglês" valor={voices.english} />
        </Secao>
      ) : null}

      {/* Mídias com imagens */}
      {midiasValidas.length > 0 ? (
        <Secao titulo="Galeria">
          <View style={styles.galeria}>
            {midiasValidas.map((m, i) => (
              <ImagemMidia key={i} uri={m.url} alt={m.alt} />
            ))}
          </View>
        </Secao>
      ) : null}

      {/* Citações */}
      {personagem.quotes && personagem.quotes.length > 0 ? (
        <Secao titulo="Citações">
          {personagem.quotes.map((q, i) => (
            <View key={i} style={styles.quoteBox}>
              <Text style={styles.quoteText}>"{q.quote}"</Text>
              {q.to ? <Text style={styles.quoteTo}>— para {q.to}</Text> : null}
              {q.reference ? (
                <Text style={styles.quoteRef}>({q.reference})</Text>
              ) : null}
            </View>
          ))}
        </Secao>
      ) : null}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

export default DetalhesScreen;

/* ---------- Componente: Avatar com loading + erro ---------- */

function ImagemAvatar({ uri }) {
  const [carregando, setCarregando] = useState(true);
  const [falhou, setFalhou] = useState(false);

  // Garante que só passa string válida para o <Image>
  const uriSegura =
    typeof uri === 'string' && uri.startsWith('http') ? uri : null;

  if (!uriSegura || falhou) {
    return (
      <View style={[styles.avatar, styles.avatarFallback]}>
        <Text style={styles.avatarFallbackText}>?</Text>
      </View>
    );
  }

  return (
    <View style={styles.avatarWrapper}>
      <Image
        source={{ uri: uriSegura }}
        style={styles.avatar}
        resizeMode="cover"
        onLoadStart={() => setCarregando(true)}
        onLoadEnd={() => setCarregando(false)}
        onError={() => {
          setFalhou(true);
          setCarregando(false);
        }}
      />
      {carregando ? (
        <View style={[styles.avatar, styles.avatarLoading]}>
          <ActivityIndicator size="small" color="#4CAF50" />
        </View>
      ) : null}
    </View>
  );
}

/* ---------- Componente: Imagem de mídia com loading + erro ---------- */

function ImagemMidia({ uri, alt }) {
  const [carregando, setCarregando] = useState(true);
  const [falhou, setFalhou] = useState(false);

  // Garante que só passa string válida para o <Image>
  const uriSegura =
    typeof uri === 'string' && uri.startsWith('http') ? uri : null;

  if (!uriSegura || falhou) {
    return (
      <View style={styles.mediaItem}>
        <View style={[styles.mediaImg, styles.mediaFallback]}>
          <Text style={styles.mediaFallbackText}>Imagem indisponível</Text>
        </View>
        {alt ? (
          <Text style={styles.mediaLegenda} numberOfLines={2}>
            {alt}
          </Text>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.mediaItem}>
      <View style={styles.mediaImg}>
        <Image
          source={{ uri: uriSegura }}
          style={styles.mediaImagem}
          resizeMode="cover"
          onLoadStart={() => setCarregando(true)}
          onLoadEnd={() => setCarregando(false)}
          onError={() => {
            setFalhou(true);
            setCarregando(false);
          }}
        />
        {carregando ? (
          <View style={styles.mediaLoading}>
            <ActivityIndicator size="small" color="#4CAF50" />
          </View>
        ) : null}
      </View>
      {alt ? (
        <Text style={styles.mediaLegenda} numberOfLines={2}>
          {alt}
        </Text>
      ) : null}
    </View>
  );
}

/* ---------- Componentes auxiliares ---------- */

function Secao({ titulo, children }) {
  return (
    <View style={styles.secao}>
      <Text style={styles.secaoTitulo}>{titulo}</Text>
      <View style={styles.secaoConteudo}>{children}</View>
    </View>
  );
}

function Linha({ label, valor }) {
  if (!valor || valor === 'Unknown' || valor === 'unknown') return null;
  return (
    <View style={styles.linha}>
      <Text style={styles.linhaLabel}>{label}</Text>
      <Text style={styles.linhaValor}>{valor}</Text>
    </View>
  );
}

/* ---------- Estilos ---------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingBottom: 30,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#7f8c8d',
  },
  erroText: {
    fontSize: 15,
    color: '#c0392b',
    textAlign: 'center',
  },

  /* Cabeçalho */
  header: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatarWrapper: {
    width: 140,
    height: 140,
    marginBottom: 14,
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#eee',
  },
  avatarLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e0e0e0',
  },
  avatarFallbackText: {
    fontSize: 48,
    color: '#9e9e9e',
    fontWeight: 'bold',
  },
  nome: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
  },
  kanji: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 4,
  },
  romaji: {
    fontSize: 14,
    color: '#95a5a6',
    fontStyle: 'italic',
    marginTop: 2,
  },
  badge: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  /* Seções */
  secao: {
    marginTop: 22,
    paddingHorizontal: 20,
  },
  secaoTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    paddingLeft: 8,
  },
  secaoConteudo: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 12,
  },

  /* Linhas chave-valor */
  linha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  linhaLabel: {
    fontSize: 13,
    color: '#7f8c8d',
    fontWeight: '600',
    flex: 1,
  },
  linhaValor: {
    fontSize: 13,
    color: '#2c3e50',
    flex: 1.4,
    textAlign: 'right',
  },

  /* Texto genérico */
  texto: {
    fontSize: 14,
    color: '#34495e',
    lineHeight: 21,
    textAlign: 'justify',
  },

  /* Galeria */
  galeria: {
    gap: 12,
  },
  mediaItem: {
    marginBottom: 4,
  },
  mediaImg: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: '#eee',
    overflow: 'hidden',
  },
  mediaImagem: {
    width: '100%',
    height: '100%',
  },
  mediaLoading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  mediaFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaFallbackText: {
    color: '#9e9e9e',
    fontSize: 13,
  },
  mediaLegenda: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 6,
    fontStyle: 'italic',
    textAlign: 'center',
  },

  /* Citações */
  quoteBox: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  quoteText: {
    fontSize: 14,
    color: '#2c3e50',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  quoteTo: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },
  quoteRef: {
    fontSize: 11,
    color: '#b0b0b0',
    marginTop: 2,
  },
});