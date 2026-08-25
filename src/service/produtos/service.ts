/**
 * [MODEL] Service de produtos
 *
 * O QUE FAZ: expõe o acesso aos dados de produto — consulta com filtro,
 * detalhe, criação, alteração, inativação e ativação.
 *
 * COMO FARÁ: `fetchProdutos(filtros)` aplica sobre `mockProdutos` todos
 * os filtros da RF0015 de forma combinável (espécie, porte, tamanho, cor,
 * marca, categoria, nome, faixa de preço e situação ativo/inativo),
 * sempre com AND entre os campos preenchidos. `fetchProdutoPorId(id)`
 * devolve o detalhe. `criarProduto` gera o SKU único da RNF0021.
 * `alterarProduto`, `inativarProduto` (grava motivo + justificativa) e
 * `ativarProduto` (idem) mutam o array em memória. Todas passam pelo
 * `delay`.
 *
 * ATENDE: RF0011-RF0016, RNF0021
 */

import {
  MOTIVO_FORA_DE_LINHA,
  mockGruposPrecificacao,
} from '@/mock/dominios/mock';
import { mockProdutos, proximoIdProduto } from '@/mock/produtos/mock';
import { delay, delayErro } from '@/service/api/delay';
import {
  AlterarProdutoPayload,
  AtivarProdutoPayload,
  CriarProdutoPayload,
  InativarProdutoPayload,
  Produto,
  ProdutoFiltros,
} from '@/types/produtos/types';

/**
 * RF0013: parâmetro predefinido de vendas mínimas. Produto sem estoque e
 * com venda acumulada abaixo deste valor é inativado automaticamente.
 */
export const PARAMETRO_VENDA_MINIMA = 5;

/** RN0013: valor de venda = custo + margem do grupo de precificação. */
export const calcularValorVenda = (
  valorCusto: number,
  grupoPrecificacaoId: number,
): number => {
  const grupo = mockGruposPrecificacao.find(g => g.id === grupoPrecificacaoId);

  return Number(
    (valorCusto * (1 + (grupo?.margemLucro ?? 0) / 100)).toFixed(2),
  );
};

/** RNF0021: SKU sequencial e único no sistema. */
const gerarSku = (id: number): string => `PET-${String(id).padStart(4, '0')}`;

export const produtosService = {
  fetchProdutos(filtros: ProdutoFiltros = {}): Promise<Produto[]> {
    // RF0015: todo campo preenchido restringe o resultado (AND entre eles).
    const resultado = mockProdutos.filter(produto => {
      if (
        filtros.nome &&
        !`${produto.nome} ${produto.sku}`
          .toLowerCase()
          .includes(filtros.nome.trim().toLowerCase())
      ) {
        return false;
      }
      if (filtros.especie && produto.especie !== filtros.especie) return false;
      if (filtros.porte && produto.porte !== filtros.porte) return false;
      if (filtros.marcaId && produto.marcaId !== filtros.marcaId) return false;
      if (
        filtros.categoriaId &&
        !produto.categoriaIds.includes(filtros.categoriaId)
      ) {
        return false;
      }
      if (filtros.corId && produto.corId !== filtros.corId) return false;
      if (filtros.materialId && produto.materialId !== filtros.materialId) {
        return false;
      }
      if (
        filtros.precoMinimo !== undefined &&
        produto.valorVenda < filtros.precoMinimo
      ) {
        return false;
      }
      if (
        filtros.precoMaximo !== undefined &&
        produto.valorVenda > filtros.precoMaximo
      ) {
        return false;
      }
      if (filtros.ativo !== undefined && produto.ativo !== filtros.ativo) {
        return false;
      }

      return true;
    });

    return delay(resultado);
  },

  fetchProdutoPorId(id: number): Promise<Produto> {
    const produto = mockProdutos.find(p => p.id === id);

    if (!produto) {
      return delayErro('Produto não encontrado.');
    }

    return delay(produto);
  },

  criarProduto(payload: CriarProdutoPayload): Promise<Produto> {
    const id = proximoIdProduto();

    const produto: Produto = {
      ...payload,
      id,
      sku: gerarSku(id),
      valorVenda: calcularValorVenda(
        payload.valorCusto,
        payload.grupoPrecificacaoId,
      ),
      // O saldo só entra pela entrada em estoque (RF0051).
      quantidadeEstoque: 0,
      ativo: true,
      totalVendido: 0,
    };

    mockProdutos.push(produto);

    return delay(produto);
  },

  alterarProduto(payload: AlterarProdutoPayload): Promise<Produto> {
    const indice = mockProdutos.findIndex(p => p.id === payload.id);

    if (indice < 0) {
      return delayErro('Produto não encontrado.');
    }

    const valorSugerido = calcularValorVenda(
      payload.valorCusto,
      payload.grupoPrecificacaoId,
    );
    const valorVenda = payload.valorVenda ?? valorSugerido;

    // RN0014: abaixo da margem do grupo, só com autorização do gerente.
    if (valorVenda < valorSugerido && !payload.autorizacaoGerente) {
      return delayErro(
        `Valor abaixo da margem do grupo de precificação (mínimo R$ ${valorSugerido.toFixed(
          2,
        )}). É necessária a autorização de um gerente de vendas.`,
      );
    }

    const { autorizacaoGerente, ...dados } = payload;

    mockProdutos[indice] = { ...mockProdutos[indice], ...dados, valorVenda };

    return delay(mockProdutos[indice]);
  },

  inativarProduto(payload: InativarProdutoPayload): Promise<Produto> {
    const indice = mockProdutos.findIndex(p => p.id === payload.id);

    if (indice < 0) {
      return delayErro('Produto não encontrado.');
    }

    // RN0015: inativação manual exige motivo e justificativa.
    mockProdutos[indice] = {
      ...mockProdutos[indice],
      ativo: false,
      motivoSituacaoId: payload.motivoId,
      justificativaSituacao: payload.justificativa,
    };

    return delay(mockProdutos[indice]);
  },

  ativarProduto(payload: AtivarProdutoPayload): Promise<Produto> {
    const indice = mockProdutos.findIndex(p => p.id === payload.id);

    if (indice < 0) {
      return delayErro('Produto não encontrado.');
    }

    // RN0017: a ativação também exige motivo e justificativa.
    mockProdutos[indice] = {
      ...mockProdutos[indice],
      ativo: true,
      motivoSituacaoId: payload.motivoId,
      justificativaSituacao: payload.justificativa,
    };

    return delay(mockProdutos[indice]);
  },

  /**
   * RF0013: inativa os produtos sem estoque cuja venda acumulada ficou
   * abaixo do parâmetro. RN0016 obriga a categorizá-los como FORA DE LINHA.
   */
  inativarAutomaticamente(): Promise<Produto[]> {
    const inativados: Produto[] = [];

    mockProdutos.forEach((produto, indice) => {
      const semEstoque = produto.quantidadeEstoque === 0;
      const vendaBaixa = produto.totalVendido < PARAMETRO_VENDA_MINIMA;

      if (!produto.ativo || !semEstoque || !vendaBaixa) return;

      mockProdutos[indice] = {
        ...produto,
        ativo: false,
        motivoSituacaoId: MOTIVO_FORA_DE_LINHA,
        justificativaSituacao: `Inativação automática: sem estoque e com apenas ${produto.totalVendido} venda(s), abaixo do parâmetro de ${PARAMETRO_VENDA_MINIMA}.`,
      };

      inativados.push(mockProdutos[indice]);
    });

    return delay(inativados);
  },
};
