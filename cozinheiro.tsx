import React, { useEffect, useState } from "react";
import { router } from "expo-router";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebaseConfig";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  GestureResponderEvent,
} from "react-native";

import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

// =====================================
// DADOS DOS DIAS
// =====================================

const dias = [
  {
    numero: 1,
    nome: "Segunda-feira",
    documento: "Segunda",
    pratoOriginal: "Frango Assado",
    acompanhamentoOriginal: "Arroz, feijão e salada",
  },
  {
    numero: 2,
    nome: "Terça-feira",
    documento: "Terça",
    pratoOriginal: "Strogonoff",
    acompanhamentoOriginal: "Arroz, batata palha",
  },
  {
    numero: 3,
    nome: "Quarta-feira",
    documento: "Quarta",
    pratoOriginal: "Macarrão com Molho de Carne",
    acompanhamentoOriginal: "Salada e fruta",
  },
  {
    numero: 4,
    nome: "Quinta-feira",
    documento: "Quinta",
    pratoOriginal: "Frango ao Molho",
    acompanhamentoOriginal: "Arroz, feijão e legumes",
  },
  {
    numero: 5,
    nome: "Sexta-feira",
    documento: "Sexta",
    pratoOriginal: "Arroz com Carne e Legumes",
    acompanhamentoOriginal: "Salada e fruta",
  },

]
// =====================================
// TELA DO COZINHEIRO
// =====================================

export default function Cozinheiro() {
  const [diaSelecionado, setDiaSelecionado] = useState(dias[0]);
  const [novoPrato, setNovoPrato] = useState("");
  const [novoAcompanhamento, setNovoAcompanhamento] = useState("");
  const [salvando, setSalvando] = useState(false);

  const [verificandoLogin, setVerificandoLogin] = useState(true);

  useEffect(() => {
  const cancelar = onAuthStateChanged(auth, (usuario) => {
    if (!usuario) {
      router.replace("/login-cozinheiro");
    } else {
      setVerificandoLogin(false);
    }
  });

  return cancelar;
}, []);


  // =====================================
  // SELECIONAR DIA
  // =====================================

  function selecionarDia(dia: typeof dias[number]) {
    setDiaSelecionado(dia);

    setNovoPrato("");
    setNovoAcompanhamento("");
  }

  // =====================================
  // SALVAR ALTERAÇÃO
  // =====================================

  async function salvarAlteracao() {

    async function retirarTodosOsAvisos() {
  try {
    const referencia = collection(db, "cardapio");
    const snapshot = await getDocs(referencia);

    for (const documento of snapshot.docs) {
      const referenciaDocumento = doc(
        db,
        "cardapio",
        documento.id
      );

      await updateDoc(referenciaDocumento, {
        Alterado: false,
      });
    }

    Alert.alert(
      "Avisos retirados",
      "Todos os avisos foram retirados do cardápio."
    );

  } catch (erro) {
    console.error("Erro ao retirar avisos:", erro);

    Alert.alert(
      "Erro",
      "Não foi possível retirar os avisos."
    );
  }
}
    if (!novoPrato.trim()) {
      Alert.alert(
        "Atenção",
        "Digite o novo prato antes de salvar."
      );
      return;
    }

    if (verificandoLogin) {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>
        Verificando acesso...
      </Text>
    </View>
  );
}

    if (!novoAcompanhamento.trim()) {
      Alert.alert(
        "Atenção",
        "Digite o novo acompanhamento antes de salvar."
      );
      return;
    }

    try {
      setSalvando(true);

      const referencia = doc(
        db,
        "cardapio",
        diaSelecionado.documento
      );

      await updateDoc(referencia, {
        Prato: novoPrato.trim(),
        Acompanhamento: novoAcompanhamento.trim(),
        Alterado: true,
      });

      Alert.alert(
        "Alteração salva!",
        `${diaSelecionado.nome} foi atualizado com sucesso.`
      );

      setNovoPrato("");
      setNovoAcompanhamento("");

    } catch (erro) {
      console.error(erro);

      Alert.alert(
        "Erro",
        "Não foi possível salvar a alteração."
      );
    } finally {
      setSalvando(false);
    }
  }

 async function retirarTodosOsAvisos() {
  try {
    const referencia = collection(db, "cardapio");
    const snapshot = await getDocs(referencia);

    for (const documento of snapshot.docs) {
      const referenciaDocumento = doc(
        db,
        "cardapio",
        documento.id
      );

      await updateDoc(referenciaDocumento, {
        Alterado: false,
      });
    }

    Alert.alert(
      "Avisos retirados",
      "Todos os avisos foram retirados do cardápio."
    );
  } catch (erro) {
    console.error("Erro ao retirar avisos:", erro);

    Alert.alert(
      "Erro",
      "Não foi possível retirar os avisos."
    );
  }
}

  // =====================================
  // INTERFACE
  // =====================================

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.conteudo}
    >

      <Text style={styles.titulo}>
        Área do Cozinheiro
      </Text>

      <Text style={styles.subtitulo}>
        Alterar o cardápio da escola
      </Text>

      {/* ================================= */}
      {/* SELEÇÃO DO DIA */}
      {/* ================================= */}

      <Text style={styles.tituloSecao}>
        1. Escolha o dia
      </Text>

      <View style={styles.diasContainer}>
        {dias.map((dia) => (
          <TouchableOpacity
            key={dia.numero}
            style={[
              styles.botaoDia,
              diaSelecionado.numero === dia.numero &&
                styles.botaoDiaSelecionado,
            ]}
            onPress={() => selecionarDia(dia)}
          >
            <Text
              style={[
                styles.textoDia,
                diaSelecionado.numero === dia.numero &&
                  styles.textoDiaSelecionado,
              ]}
            >
              {dia.nome}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ================================= */}
      {/* PRATO ATUAL */}
      {/* ================================= */}

      <Text style={styles.tituloSecao}>
        2. Prato atual
      </Text>

      <View style={styles.cardAtual}>
        <Text style={styles.label}>
          {diaSelecionado.nome}
        </Text>

        <Text style={styles.pratoAtual}>
          {diaSelecionado.pratoOriginal}
        </Text>

        <Text style={styles.acompanhamentoAtual}>
          {diaSelecionado.acompanhamentoOriginal}
        </Text>
      </View>

      {/* ================================= */}
      {/* NOVO PRATO */}
      {/* ================================= */}

      <Text style={styles.tituloSecao}>
        3. Informe a substituição
      </Text>

      <Text style={styles.labelInput}>
        Novo prato
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Ex.: Frango Assado"
        placeholderTextColor="#888"
        value={novoPrato}
        onChangeText={setNovoPrato}
      />

      <Text style={styles.labelInput}>
        Novo acompanhamento
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Ex.: Arroz e salada"
        placeholderTextColor="#888"
        value={novoAcompanhamento}
        onChangeText={setNovoAcompanhamento}
      />

      {/* ================================= */}
      {/* BOTÃO SALVAR */}
      {/* ================================= */}

      <TouchableOpacity
        style={[
          styles.botaoSalvar,
          salvando && styles.botaoDesativado,
        ]}
        onPress={salvarAlteracao}
        disabled={salvando}
      >
        <Text style={styles.textoBotaoSalvar}>
          {salvando
            ? "Salvando..."
            : "Salvar alteração"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
  style={styles.botaoVoltar}
  onPress={() => router.replace("/")}
>
  <Text style={styles.textoBotaoVoltar}>
    🍽️ Voltar ao Cardápio
  </Text>
</TouchableOpacity>

      <Text style={styles.aviso}>
        A alteração será salva no Firebase e poderá
        ser visualizada pelos alunos ao atualizar
        o cardápio.
      </Text>

      <TouchableOpacity
  style={styles.botaoRetirarAvisos}
  onPress={retirarTodosOsAvisos}
>
  <Text style={styles.textoBotaoRetirarAvisos}>
    🗑️ Retirar todos os avisos
  </Text>
</TouchableOpacity>

    </ScrollView>
  );
}

// =====================================
// ESTILOS
// =====================================

const styles = StyleSheet.create({


  container: {
    flex: 1,
    backgroundColor: "#8B4513",
  },

  conteudo: {
    padding: 20,
    paddingBottom: 50,
  },

  titulo: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginTop: 20,
  },

  subtitulo: {
    fontSize: 16,
    color: "#D2B48C",
    textAlign: "center",
    marginTop: 5,
    marginBottom: 30,
  },

  tituloSecao: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#F08080",
    marginTop: 20,
    marginBottom: 12,
  },

  diasContainer: {
    gap: 10,
  },

  botaoDia: {
    backgroundColor: "#D2B48C",
    padding: 16,
    borderRadius: 12,
  },

  botaoDiaSelecionado: {
    backgroundColor: "#FFFFFF",
    borderWidth: 3,
    borderColor: "#F08080",
  },

  textoDia: {
    color: "#222222",
    fontSize: 17,
    fontWeight: "bold",
  },

  textoDiaSelecionado: {
    color: "#8B4513",
  },

  cardAtual: {
    backgroundColor: "#D2B48C",
    padding: 20,
    borderRadius: 15,
  },

  label: {
    fontSize: 15,
    color: "#555555",
    fontWeight: "bold",
  },

  pratoAtual: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#202124",
    marginTop: 8,
  },

  acompanhamentoAtual: {
    fontSize: 17,
    color: "#FFFFFF",
    marginTop: 8,
  },

  labelInput: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 15,
    marginBottom: 7,
  },

  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 16,
    color: "#222222",
  },

  botaoSalvar: {
    backgroundColor: "#F08080",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 30,
  },

  botaoDesativado: {
    opacity: 0.5,
  },

  textoBotaoSalvar: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },

  aviso: {
    color: "#D2B48C",
    fontSize: 14,
    textAlign: "center",
    marginTop: 20,
    lineHeight: 20,
  },

  botaoVoltar: {
  backgroundColor: "#FFFFFF",
  paddingVertical: 15,
  borderRadius: 12,
  alignItems: "center",
  marginTop: 15,
  borderWidth: 2,
  borderColor: "#F08080",
},

textoBotaoVoltar: {
  color: "#8B4513",
  fontSize: 17,
  fontWeight: "bold",
},
botaoRetirarAvisos: {
  backgroundColor: "#B71C1C",
  paddingVertical: 14,
  paddingHorizontal: 20,
  borderRadius: 12,
  alignItems: "center",
  marginTop: 12,
  marginBottom: 20,
},

textoBotaoRetirarAvisos: {
  color: "#FFFFFF",
  fontSize: 16,
  fontWeight: "bold",
},

});