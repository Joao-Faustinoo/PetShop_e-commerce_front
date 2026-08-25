/**
 * [MODEL] Service do assistente de recomendação
 *
 * O QUE FAZ: simula a conversa com a IA generativa que recomenda produtos
 * ao cliente.
 *
 * COMO FARÁ: `fetchConversaInicial()` devolve a mensagem de boas-vindas;
 * `enviarMensagem({ texto, contexto })` casa o texto contra
 * `mockRespostas` por palavra-chave e devolve uma `Mensagem` do
 * assistente já com os produtos sugeridos, filtrados pela espécie e pelo
 * porte dos pets do contexto. Quando houver modelo real, é só esta função
 * que passa a chamar a API.
 *
 * ATENDE: RNF0047
 */

import {
  mockConversaInicial,
  mockRespostas,
  respostaPadrao,
  respostaSemPet,
} from '@/mock/chat/mock';
import { mockPedidos } from '@/mock/pedidos/mock';
import { mockPets } from '@/mock/pets/mock';
import { mockProdutos } from '@/mock/produtos/mock';
import { delay } from '@/service/api/delay';
import { ContextoRecomendacao, Mensagem } from '@/types/chat/types';
import { Pet } from '@/types/pets/types';
import { Produto } from '@/types/produtos/types';

const LIMITE_SUGESTOES = 4;

let proximoIdMensagem = mockConversaInicial.length + 1;

const normalizar = (texto: string): string =>
  texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/**
 * RNF0047: o contexto que alimentaria o modelo — pets, histórico de
 * compras e preferências deduzidas desse histórico.
 */
export const montarContexto = (clienteId: number): ContextoRecomendacao => {
  const pets = mockPets.filter(p => p.clienteId === clienteId);
  const pedidos = mockPedidos.filter(
    p => p.clienteId === clienteId && p.status !== 'REPROVADA',
  );

  const produtosComprados = pedidos.flatMap(p => p.itens.map(i => i.produtoId));

  const contarOcorrencias = (valores: number[]): number[] => {
    const contagem = new Map<number, number>();
    valores.forEach(v => contagem.set(v, (contagem.get(v) ?? 0) + 1));

    return Array.from(contagem.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([valor]) => valor);
  };

  const comprados = mockProdutos.filter(p => produtosComprados.includes(p.id));

  return {
    pets,
    produtosComprados,
    categoriasPreferidas: contarOcorrencias(
      comprados.flatMap(p => p.categoriaIds),
    ),
    marcasPreferidas: contarOcorrencias(comprados.map(p => p.marcaId)),
  };
};

/**
 * Ordena as sugestões pelo que mais combina com o cliente: primeiro o que
 * serve para a espécie e o porte do pet, depois as categorias e marcas
 * que ele já costuma comprar.
 */
const pontuar = (
  produto: Produto,
  pet: Pet | undefined,
  contexto: ContextoRecomendacao,
): number => {
  let pontos = 0;

  if (pet) {
    if (produto.especie === pet.especie) pontos += 10;
    if (produto.porte === pet.porte) pontos += 8;
  }

  const posicaoCategoria = contexto.categoriasPreferidas.findIndex(c =>
    produto.categoriaIds.includes(c),
  );
  if (posicaoCategoria >= 0) pontos += Math.max(0, 5 - posicaoCategoria);

  const posicaoMarca = contexto.marcasPreferidas.indexOf(produto.marcaId);
  if (posicaoMarca >= 0) pontos += Math.max(0, 3 - posicaoMarca);

  // Já comprado perde prioridade: a ideia é sugerir algo novo.
  if (contexto.produtosComprados.includes(produto.id)) pontos -= 4;

  return pontos;
};

/**
 * As respostas do assistente afirmam que as sugestões servem para a
 * espécie e o porte do pet, então o recorte precisa acontecer antes da
 * ordenação — a pontuação sozinha apenas empurra o que não serve para o
 * fim da lista, sem tirá-lo dela. Se o corte exato não sobrar nada, vale
 * mais soltar o porte (e depois a espécie) do que devolver a conversa
 * vazia.
 */
const servemAoPet = (produtos: Produto[], pet: Pet | undefined): Produto[] => {
  if (!pet) return produtos;

  const daEspecie = produtos.filter(p => p.especie === pet.especie);
  const doPorte = daEspecie.filter(p => p.porte === pet.porte);

  if (doPorte.length > 0) return doPorte;
  if (daEspecie.length > 0) return daEspecie;

  return produtos;
};

export const chatService = {
  fetchConversaInicial(): Promise<Mensagem[]> {
    return delay(mockConversaInicial, 200);
  },

  enviarMensagem(
    texto: string,
    contexto: ContextoRecomendacao,
  ): Promise<Mensagem> {
    const entrada = normalizar(texto);
    const regra = mockRespostas.find(r =>
      r.palavras.some(palavra => entrada.includes(normalizar(palavra))),
    );

    // O pet considerado é o primeiro cujo porte/espécie casa com a busca,
    // ou simplesmente o primeiro cadastrado.
    const pet = contexto.pets[0];
    const disponiveis = mockProdutos.filter(
      p => p.ativo && p.quantidadeEstoque > 0,
    );

    const candidatos = regra ? regra.filtrar(disponiveis) : disponiveis;

    const produtosSugeridos = [...servemAoPet(candidatos, pet)]
      .sort((a, b) => pontuar(b, pet, contexto) - pontuar(a, pet, contexto))
      .slice(0, LIMITE_SUGESTOES);

    const base = (() => {
      if (contexto.pets.length === 0) return respostaSemPet;

      return regra?.texto ?? respostaPadrao;
    })();

    const mensagem: Mensagem = {
      // eslint-disable-next-line no-plusplus
      id: ++proximoIdMensagem,
      autor: 'ASSISTENTE',
      texto: base.replace('{pet}', pet?.nome ?? 'seu pet'),
      dataHora: new Date().toISOString(),
      produtosSugeridos,
    };

    // Latência maior: é o tempo que um modelo generativo levaria.
    return delay(mensagem, 700);
  },

  /** Id sequencial para as mensagens que o próprio cliente envia. */
  proximoId(): number {
    // eslint-disable-next-line no-plusplus
    return ++proximoIdMensagem;
  },
};
