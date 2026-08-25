/**
 * [VIEW] Tela: Estoque
 *
 * O QUE FAZ: mostra a posição de estoque por produto e registra entradas.
 *
 * COMO FARÁ: consome o useEstoqueController para a tabela (disponível, bloqueado e
 * custo vigente) com busca debounced, e o useEntradaEstoqueController para
 * o formulário de entrada, que exige produto, quantidade, custo, fornecedor
 * e data. Exibe o extrato de movimentações do produto selecionado.
 *
 * ATENDE: RF0051, RF0052, RN0050, RN0051, RN0061, RN0062, RNF0064
 */

'use client';

import { useMemo, useState } from 'react';
import { FiPlus } from 'react-icons/fi';

import PrimaryButton from '@/components/Buttons/Primary/button';
import EntradaEstoqueForm from '@/components/Forms/EntradaEstoqueForm/EntradaEstoqueForm';
import SearchInput from '@/components/Inputs/SearchInput/input';
import Modal from '@/components/Modals';
import TabelaSkeleton from '@/components/skeletons/TabelaSkeleton';
import {
  nomeDoDominio,
  useDominiosController,
} from '@/controllers/dominios/useDominiosController';
import { useEntradaEstoqueController } from '@/controllers/estoque/useEntradaEstoqueController';
import { useEstoqueController } from '@/controllers/estoque/useEstoqueController';
import { useProdutosController } from '@/controllers/produtos/useProdutosController';
import { useDebounce } from '@/hooks/useDebounce';
import { EstoqueFiltros } from '@/types/estoque/types';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';

import * as S from './styles';

const AdminEstoque = () => {
  const { fornecedores } = useDominiosController();
  const { produtos } = useProdutosController();
  const { registrarEntrada, isPending } = useEntradaEstoqueController();

  const [busca, setBusca] = useState('');
  const buscaDebounced = useDebounce(busca);
  const [apenasSemEstoque, setApenasSemEstoque] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);

  const filtros = useMemo<EstoqueFiltros>(
    () => ({
      produtoNome: buscaDebounced || undefined,
      apenasSemEstoque: apenasSemEstoque || undefined,
    }),
    [buscaDebounced, apenasSemEstoque],
  );

  const { itens, movimentacoes, itensZerados, temItensZerados, isLoading } =
    useEstoqueController(filtros);

  return (
    <S.Container>
      <S.Cabecalho>
        <S.Titulo>
          <h1>Estoque</h1>
          <p>Posição por produto e histórico de movimentações</p>
        </S.Titulo>

        <PrimaryButton
          label="Registrar entrada"
          icon={<FiPlus size={16} />}
          onClick={() => setModalAberto(true)}
        />
      </S.Cabecalho>

      {/* RF0013: saldo zerado é o gatilho da inativação automática. */}
      {temItensZerados && (
        <S.Alerta $tipo="alerta">
          {itensZerados.length} produto(s) estão com saldo zerado e podem ser
          alvo da inativação automática.
        </S.Alerta>
      )}

      <S.Filtros $colunas={4}>
        <S.CampoFiltro $span={2}>
          <SearchInput
            value={busca}
            onChange={setBusca}
            placeholder="Buscar por nome ou SKU..."
          />
        </S.CampoFiltro>

        <S.CampoFiltro>
          <label htmlFor="semEstoque">Filtro rápido</label>
          <select
            id="semEstoque"
            value={apenasSemEstoque ? 'zerados' : ''}
            onChange={evento =>
              setApenasSemEstoque(evento.target.value === 'zerados')
            }
          >
            <option value="">Todos os produtos</option>
            <option value="zerados">Somente sem estoque</option>
          </select>
        </S.CampoFiltro>
      </S.Filtros>

      {isLoading ? (
        <TabelaSkeleton colunas={5} />
      ) : (
        <S.TabelaWrapper>
          <S.Tabela>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Produto</th>
                <th className="numero">Disponível</th>
                <th className="numero">Bloqueado</th>
                <th className="numero">Maior custo</th>
              </tr>
            </thead>

            <tbody>
              {itens.map(item => (
                <tr key={item.produtoId}>
                  <td>{item.produtoSku}</td>
                  <td>{item.produtoNome}</td>
                  <td className="numero">
                    {item.quantidadeDisponivel === 0 ? (
                      <S.Zerado>0</S.Zerado>
                    ) : (
                      item.quantidadeDisponivel
                    )}
                  </td>
                  <td className="numero">
                    {item.quantidadeBloqueada}
                    {item.quantidadeBloqueada > 0 && (
                      <S.Bloqueado>em carrinhos</S.Bloqueado>
                    )}
                  </td>
                  {/* RN0051: o maior custo é o que vale para todo o saldo. */}
                  <td className="numero">
                    {formatCurrency(item.maiorValorCusto)}
                  </td>
                </tr>
              ))}
            </tbody>
          </S.Tabela>
        </S.TabelaWrapper>
      )}

      <S.Secao>
        <S.TituloSecao>Movimentações recentes</S.TituloSecao>

        <S.TabelaWrapper>
          <S.Tabela>
            <thead>
              <tr>
                <th>Data</th>
                <th>Tipo</th>
                <th>Produto</th>
                <th className="numero">Qtd.</th>
                <th className="numero">Custo</th>
                <th>Fornecedor</th>
                <th>Observação</th>
              </tr>
            </thead>

            <tbody>
              {movimentacoes.slice(0, 20).map(movimentacao => (
                <tr key={movimentacao.id}>
                  <td>{formatDate(movimentacao.dataEntrada)}</td>
                  <td>
                    <S.Movimentacao $tipo={movimentacao.tipo}>
                      {movimentacao.tipo}
                    </S.Movimentacao>
                  </td>
                  <td>{movimentacao.produtoNome}</td>
                  <td className="numero">{movimentacao.quantidade}</td>
                  <td className="numero">
                    {formatCurrency(movimentacao.valorCusto)}
                  </td>
                  <td>
                    {movimentacao.fornecedorId
                      ? nomeDoDominio(fornecedores, movimentacao.fornecedorId)
                      : '-'}
                  </td>
                  <td>{movimentacao.observacao ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </S.Tabela>
        </S.TabelaWrapper>
      </S.Secao>

      <Modal
        aberto={modalAberto}
        titulo="Registrar entrada em estoque"
        onClose={() => setModalAberto(false)}
        largura="media"
      >
        <EntradaEstoqueForm
          produtos={produtos}
          isPending={isPending}
          onCancelar={() => setModalAberto(false)}
          onSubmit={dados =>
            registrarEntrada(dados, { onSuccess: () => setModalAberto(false) })
          }
        />
      </Modal>
    </S.Container>
  );
};

export default AdminEstoque;
