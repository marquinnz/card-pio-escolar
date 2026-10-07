import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import { router } from "expo-router";

import {
  collection,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";

import { db } from "./firebaseConfig";

// ======================================================
// TIPO DA REFEIÇÃO
// ======================================================

type Refeicao = {
  dia: string;
  numero: number;
  prato: string;
  acompanhamento: string;
  imagem: any;
  alterado: boolean;
};

// ======================================================
// IMAGENS
// ======================================================

const imagens: { [key: number]: any } = {
  1: require("../../assets/images/segunda-feira.webp"),
  2: require("../../assets/images/terca-feira.jpg"),
  3: require("../../assets/images/quarta-feira.webp"),
  4: require("../../assets/images/quinta-feira.jpg"),
  5: require("../../assets/images/sexta-feira.webp"),
};

// ======================================================
// CARDÁPIO PADRÃO
// ======================================================

const cardapioInicial: Refeicao[] = [
  {
    dia: "Segunda-feira",
    numero: 1,
    prato: "Frango Assado",
    acompanhamento: "Arroz, feijão e salada",
    imagem: imagens[1],
    alterado: false,
  },
  {
    dia: "Terça-feira",
    numero: 2,
    prato: "Strogonoff",
    acompanhamento: "Arroz, batata palha",
    imagem: imagens[2],
    alterado: false,
  },
  {
    dia: "Quarta-feira",
    numero: 3,
    prato: "Macarrão com Molho de Carne",
    acompanhamento: "Salada e fruta",
    imagem: imagens[3],
    alterado: false,
  },
  {
    dia: "Quinta-feira",
    numero: 4,
    prato: "Frango ao Molho",
    acompanhamento: "Arroz, feijão e legumes",
    imagem: imagens[4],
    alterado: false,
  },
  {
    dia: "Sexta-feira",
    numero: 5,
    prato: "Arroz com Carne e Legumes",
    acompanhamento: "Salada e fruta",
    imagem: imagens[5],
    alterado: false,
  },
];

// ======================================================
// FUNÇÃO PARA DESCOBRIR O NÚMERO DO DIA
// ======================================================

function descobrirNumero(
  dados: any,
  idDocumento: string
): number {
  if (dados.Numero) {
    return Number(dados.Numero);
  }

  const id = idDocumento.toLowerCase();

  if (id.includes("segunda")) return 1;

  if (
    id.includes("terça") ||
    id.includes("terca")
  ) {
    return 2;
  }

  if (id.includes("quarta")) return 3;

  if (id.includes("quinta")) return 4;

  if (id.includes("sexta")) return 5;

  return 0;
}

// ======================================================
// COMPONENTE PRINCIPAL
// ======================================================

export default function Index() {
  const [cardapio, setCardapio] =
    useState<Refeicao[]>(cardapioInicial);

  const [carregando, setCarregando] =
    useState(true);

  const [atualizando, setAtualizando] =
    useState(false);

  // ====================================================
  // BUSCAR CARDÁPIO NO FIREBASE
  // ====================================================

  async function carregarCardapio(
    mostrarCarregando: boolean = false
  ) {
    try {
      if (mostrarCarregando) {
        setAtualizando(true);
      }

      const referencia = collection(
        db,
        "cardapio"
      );

      const snapshot = await getDocs(
        referencia
      );

      const dadosFirebase: Refeicao[] = [];

      snapshot.forEach((documento) => {
        const dados = documento.data();

        const numero = descobrirNumero(
          dados,
          documento.id
        );

        if (numero >= 1 && numero <= 5) {
          const refeicaoOriginal =
            cardapioInicial[numero - 1];

         dadosFirebase.push({
  dia: dados.Dia || refeicaoOriginal.dia,
  numero,
  prato: dados.Prato || refeicaoOriginal.prato,
  acompanhamento:
    dados.Acompanhamento || refeicaoOriginal.acompanhamento,
  imagem: imagens[numero],
  alterado: dados.Alterado === true,
});
        }
      });

      // ==================================================
      // SE O FIREBASE TIVER DADOS
      // ==================================================

      if (dadosFirebase.length > 0) {
        const cardapioFinal =
          cardapioInicial.map((original) => {
            const encontrado =
              dadosFirebase.find(
                (item) =>
                  item.numero ===
                  original.numero
              );

            if (encontrado) {
              return encontrado;
            }

            return original;
          });

        cardapioFinal.sort(
          (a, b) =>
            a.numero - b.numero
        );

        setCardapio(cardapioFinal);
      } else {
        setCardapio(cardapioInicial);
      }

    } catch (erro) {
      console.error(
        "Erro ao carregar cardápio:",
        erro
      );

      setCardapio((atual) =>
        atual.length > 0
          ? atual
          : cardapioInicial
      );

    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }

  // ====================================================
  // CARREGAR AO ABRIR O APLICATIVO
  // ====================================================

  useEffect(() => {
    carregarCardapio();
  }, []);

  // ====================================================
  // DESCOBRIR O DIA ATUAL
  // ====================================================

  const hoje = new Date();

  const diaSemana = hoje.getDay();

  let numeroHoje = diaSemana;

  // Domingo = 0
  // Segunda = 1
  // Terça = 2
  // Quarta = 3
  // Quinta = 4
  // Sexta = 5
  // Sábado = 6

  if (
    numeroHoje < 1 ||
    numeroHoje > 5
  ) {
    numeroHoje = 1;
  }

  const refeicaoHoje =
    cardapio.find(
      (item) =>
        item.numero === numeroHoje
    ) || cardapio[0];

  // ====================================================
  // TELA DE CARREGAMENTO
  // ====================================================

  if (carregando) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <View
          style={styles.carregandoContainer}
        >
          <ActivityIndicator
            size="large"
            color="#8B4513"
          />

          <Text
            style={styles.textoCarregando}
          >
            Carregando cardápio...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ====================================================
  // INTERFACE
  // ====================================================

  return (
    <SafeAreaView
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={
          styles.conteudo
        }
        showsVerticalScrollIndicator={false}
      >

        {/* TÍTULO */}

        <Text style={styles.titulo}>
          🍽️ Cardápio Escolar
        </Text>

        <Text style={styles.subtitulo}>
          Confira a refeição de hoje
        </Text>

        {/* BOTÃO ATUALIZAR */}

        <TouchableOpacity
          style={[
            styles.botaoAtualizar,
            atualizando &&
              styles.botaoDesativado,
          ]}
          onPress={() =>
            carregarCardapio(true)
          }
          disabled={atualizando}
        >
          {atualizando ? (
            <ActivityIndicator
              color="#FFFFFF"
            />
          ) : (
            <Text
              style={
                styles.textoBotaoAtualizar
              }
            >
              🔄 Atualizar Cardápio
            </Text>
          )}
        </TouchableOpacity>

        {/* REFEIÇÃO DE HOJE */}

        {refeicaoHoje && (
          <View style={styles.cardHoje}>

            <Text
              style={styles.tituloHoje}
            >
              📅 Hoje
            </Text>

            <Text style={styles.diaHoje}>
              {refeicaoHoje.dia}
            </Text>

            <Image
              source={refeicaoHoje.imagem}
              style={styles.imagemHoje}
              resizeMode="contain"
            />

            <Text
              style={styles.pratoHoje}
            >
              {refeicaoHoje.prato}
            </Text>

            <Text
              style={
                styles.acompanhamentoHoje
              }
            >
              {refeicaoHoje.acompanhamento}
            </Text>

            {/* AVISO DE ALTERAÇÃO */}
           

            {refeicaoHoje.alterado && (
              <View
                style={
                  styles.avisoAlteracao
                }
              >
                <Text
                  style={
                    styles.tituloAviso
                  }
                >
                  ⚠️ AVISO
                </Text>

                <Text
                  style={
                    styles.textoAviso
                  }
                >
                  A refeição será:
                </Text>

                <Text
                  style={
                    styles.pratoAviso
                  }
                >
                  {refeicaoHoje.prato}
                </Text>

                <Text
                  style={
                    styles.acompanhamentoAviso
                  }
                >
                  {refeicaoHoje.acompanhamento}
                </Text>
              </View>
            )}

          </View>
        )}

        {/* CARDÁPIO DA SEMANA */}

        <Text
          style={styles.tituloSemana}
        >
          📋 Cardápio da Semana
        </Text>

        {cardapio.map((refeicao) => (
          <View
  key={refeicao.numero}
  style={styles.cardRefeicao}
>
  <Image
    source={refeicao.imagem}
    style={styles.imagemRefeicao}
    resizeMode="cover"
  />

  <View
    style={styles.informacoesRefeicao}
  >

              <Text
                style={styles.diaRefeicao}
              >
                {refeicao.dia}
              </Text>

              <Text
                style={styles.pratoRefeicao}
              >
                {refeicao.prato}
              </Text>

              <Text
                style={
                  styles.acompanhamentoRefeicao
                }
              >
                {refeicao.acompanhamento}
              </Text>

              {/* AVISO DE ALTERAÇÃO */}

              {refeicao.alterado && (
                <View
                  style={
                    styles.avisoAlteracaoSemana
                  }
                >
                  <Text
                    style={
                      styles.tituloAvisoSemana
                    }
                  >
                    ⚠️ Aviso: a refeição será
                  </Text>

                  <Text
                    style={
                      styles.pratoAvisoSemana
                    }
                  >
                    {refeicao.prato}
                  </Text>

                  <Text
                    style={
                      styles.acompanhamentoAvisoSemana
                    }
                  >
                    {refeicao.acompanhamento}
                  </Text>
                </View>
              )}

            </View>
          </View>
        ))}

        {/* ÁREA DO COZINHEIRO */}

        <View
          style={
            styles.areaCozinheiro
          }
        >
          <TouchableOpacity
            style={
              styles.botaoCozinheiro
            }
            onPress={() =>
              router.push(
                "/login-cozinheiro"
              )
            }
          >
            <Text
              style={
                styles.textoBotaoCozinheiro
              }
            >
              👨‍🍳 Área do Cozinheiro
            </Text>
          </TouchableOpacity>
        </View>

        {/* RODAPÉ */}

        <Text style={styles.rodape}>
          Cardápio Escolar
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

// ======================================================
// ESTILOS
// ======================================================

const styles = StyleSheet.create({

  imagemRefeicao: {
  width: 90,
  height: 90,
  borderRadius: 12,
  marginBottom: 10,
},

  container: {
    flex: 1,
    backgroundColor: "#8B4513",
  },

  conteudo: {
    padding: 20,
    paddingBottom: 40,
  },

  titulo: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000000",
    textAlign: "center",
    marginTop: 10,
  },

  subtitulo: {
    fontSize: 16,
    color: "#ffffff",
    textAlign: "center",
    marginTop: 5,
    marginBottom: 15,
  },

  // ====================================================
  // BOTÃO ATUALIZAR
  // ====================================================

  botaoAtualizar: {
    backgroundColor: "#8B4513",
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },

  textoBotaoAtualizar: {
    color: "#1C1C1C",
    fontSize: 16,
    fontWeight: "bold",
  },

  botaoDesativado: {
    opacity: 0.6,
  },

  // ====================================================
  // CARREGAMENTO
  // ====================================================

  carregandoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  textoCarregando: {
    fontSize: 17,
    color: "#000000ff",
    marginTop: 12,
    fontWeight: "bold",
  },

  // ====================================================
  // CARD DE HOJE
  // ====================================================

  cardHoje: {
    backgroundColor: "#F5DEB3",
    borderRadius: 20,
    padding: 18,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  tituloHoje: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000000",
    textAlign: "center",
  },

  diaHoje: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#555555",
    textAlign: "center",
    marginTop: 5,
    marginBottom: 15,
  },

  imagemHoje: {
    width: "100%",
    height: 260,
    borderRadius: 15,
    marginBottom: 15,
  },

  pratoHoje: {
    fontSize: 27,
    fontWeight: "bold",
    color: "#000000",
    textAlign: "center",
  },

  acompanhamentoHoje: {
    fontSize: 17,
    color: "#555555",
    textAlign: "center",
    marginTop: 8,
  },

  // ====================================================
  // AVISO DE ALTERAÇÃO - HOJE
  // ====================================================

  avisoAlteracao: {
    backgroundColor: "#F5DEB3",
    borderWidth: 2,
    borderColor: "#FF69B4",
    borderRadius: 12,
    padding: 14,
    marginTop: 18,
  },

  tituloAviso: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#B71C1C",
    marginBottom: 5,
  },

  textoAviso: {
    fontSize: 15,
    color: "#6D4C41",
    fontWeight: "bold",
  },

  pratoAviso: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#8B4513",
    marginTop: 4,
  },

  acompanhamentoAviso: {
    fontSize: 15,
    color: "#555555",
    marginTop: 4,
  },

  // ====================================================
  // TÍTULO SEMANA
  // ====================================================

  tituloSemana: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginTop: 30,
    marginBottom: 15,
  },

  // ====================================================
  // CARDS DA SEMANA
  // ====================================================

  cardRefeicao: {
    backgroundColor: "#F5DEB3",
    borderRadius: 15,
    padding: 17,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  informacoesRefeicao: {
    flex: 1,
  },

  diaRefeicao: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#8B4513",
    marginBottom: 5,
  },

  pratoRefeicao: {
    fontSize: 21,
    fontWeight: "bold",
    color: "#222222",
  },

  acompanhamentoRefeicao: {
    fontSize: 15,
    color: "#666666",
    marginTop: 5,
  },

  // ====================================================
  // AVISO DE ALTERAÇÃO - SEMANA
  // ====================================================

  avisoAlteracaoSemana: {
    backgroundColor: "#FFF3CD",
    borderLeftWidth: 5,
    borderLeftColor: "#FF69B4",
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
  },

  tituloAvisoSemana: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#B71C1C",
  },

  pratoAvisoSemana: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#8B4513",
    marginTop: 3,
  },

  acompanhamentoAvisoSemana: {
    fontSize: 14,
    color: "#ffffff",
    marginTop: 2,
  },

  // ====================================================
  // ÁREA DO COZINHEIRO
  // ====================================================

  areaCozinheiro: {
    alignItems: "flex-end",
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 5,
  },

  botaoCozinheiro: {
    backgroundColor: "#F4A460",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
  },

  textoBotaoCozinheiro: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "bold",
  },

  // ====================================================
  // RODAPÉ
  // ====================================================

  rodape: {
    textAlign: "center",
    color: "#DEB887",
    fontSize: 14,
    marginTop: 20,
    marginBottom: 10,
  },

});