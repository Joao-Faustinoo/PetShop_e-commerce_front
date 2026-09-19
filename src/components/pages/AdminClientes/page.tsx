/**
 * [VIEW] Tela: Clientes
 *
 * O QUE FAZ: consulta de clientes do administrador, com filtros combinados.
 *
 * COMO FARÁ: consome o useClientesController com o termo debounced. A tabela traz
 * código, nome, CPF, e-mail, ranking e situação, com ação de inativar e
 * link para o detalhe.
 *
 * A mudança de situação passa pelo ConfirmarSituacaoCliente, que colhe a
 * justificativa gravada junto com o registro (RNF0012). O cadastro nunca é
 * excluído: a RF0023 manda inativar, e não há ação de exclusão nesta tela
 * nem rota para ela na API.
 *
 * ATENDE: RF0023, RF0024, RN0027, RNF0012, RNF0035
 */

'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiEye, FiPower } from 'react-icons/fi';

import SearchInput from '@/components/Inputs/SearchInput/input';
import ConfirmarSituacaoCliente from '@/components/Modals/ConfirmarSituacaoCliente';
import TabelaSkeleton from '@/components/skeletons/TabelaSkeleton';
import { faixaDoRanking } from '@/controllers/clientes/useClienteController';
import { useClientesController } from '@/controllers/clientes/useClientesController';
import { useDebounce } from '@/hooks/useDebounce';
import { Cliente, ClienteFiltros, Genero } from '@/types/clientes/types';

import * as S from './styles';

const AdminClientes = () => {
  const router = useRouter();

  const [busca, setBusca] = useState('');
  const buscaDebounced = useDebounce(busca);
  const [situacao, setSituacao] = useState('');
  const [genero, setGenero] = useState('');
  const [rankingMinimo, setRankingMinimo] = useState('');

  // RF0024: qualquer campo identificador filtra, isolado ou combinado.
  const filtros = useMemo<ClienteFiltros>(
    () => ({
      nome: buscaDebounced || undefined,
      ativo: situacao === '' ? undefined : situacao === 'ativos',
      genero: (genero as Genero) || undefined,
      rankingMinimo: rankingMinimo ? Number(rankingMinimo) : undefined,
    }),
    [buscaDebounced, situacao, genero, rankingMinimo],
  );

  const { clientes, total, inativar, ativar, isPending, isLoading } =
    useClientesController(filtros);

  // Quem está selecionado para mudar de situação; undefined = modal fechado.
  const [emSituacao, setEmSituacao] = useState<Cliente>();

  const confirmarSituacao = (justificativa: string) => {
    if (!emSituacao) return;

    const payload = { id: emSituacao.id, justificativa };
    const aoTerminar = { onSuccess: () => setEmSituacao(undefined) };

    if (emSituacao.ativo) {
      inativar(payload, aoTerminar);
    } else {
      ativar(payload, aoTerminar);
    }
  };

  return (
    <S.Container>
      <S.Cabecalho>
        <S.Titulo>
          <h1>Clientes</h1>
          <p>{total} cliente(s) no filtro atual</p>
        </S.Titulo>
      </S.Cabecalho>

      <S.Filtros $colunas={4}>
        <S.CampoFiltro $span={2}>
          <SearchInput
            value={busca}
            onChange={setBusca}
            placeholder="Buscar por nome..."
          />
        </S.CampoFiltro>

        <S.CampoFiltro>
          <label htmlFor="situacao">Situação</label>
          <select
            id="situacao"
            value={situacao}
            onChange={evento => setSituacao(evento.target.value)}
          >
            <option value="">Todas</option>
            <option value="ativos">Ativos</option>
            <option value="inativos">Inativos</option>
          </select>
        </S.CampoFiltro>

        <S.CampoFiltro>
          <label htmlFor="genero">Gênero</label>
          <select
            id="genero"
            value={genero}
            onChange={evento => setGenero(evento.target.value)}
          >
            <option value="">Todos</option>
            <option value="FEMININO">Feminino</option>
            <option value="MASCULINO">Masculino</option>
            <option value="OUTRO">Outro</option>
          </select>
        </S.CampoFiltro>

        <S.CampoFiltro>
          <label htmlFor="ranking">Ranking mínimo</label>
          <select
            id="ranking"
            value={rankingMinimo}
            onChange={evento => setRankingMinimo(evento.target.value)}
          >
            <option value="">Qualquer</option>
            {[1, 2, 3, 4, 5].map(nota => (
              <option key={nota} value={nota}>
                {nota} — {faixaDoRanking(nota)}
              </option>
            ))}
          </select>
        </S.CampoFiltro>
      </S.Filtros>

      {isLoading ? (
        <TabelaSkeleton colunas={7} />
      ) : clientes.length === 0 ? (
        <S.Vazio>
          <strong>Nenhum cliente encontrado</strong>
          <p>Ajuste os filtros da consulta.</p>
        </S.Vazio>
      ) : (
        <S.TabelaWrapper>
          <S.Tabela>
            <thead>
              <tr>
                <th>Código</th>
                <th>Nome</th>
                <th>CPF</th>
                <th>E-mail</th>
                <th>Ranking</th>
                <th>Situação</th>
                <th aria-label="Ações" />
              </tr>
            </thead>

            <tbody>
              {clientes.map(cliente => (
                <tr key={cliente.id}>
                  {/* RNF0035: código único do cliente. */}
                  <td>{cliente.codigo}</td>
                  <td>{cliente.nome}</td>
                  <td>{cliente.cpf}</td>
                  <td>{cliente.email}</td>
                  <td>
                    {/* RN0027: ranking numérico + faixa legível. */}
                    <S.Ranking>
                      {cliente.ranking}
                      <small>{faixaDoRanking(cliente.ranking)}</small>
                    </S.Ranking>
                  </td>
                  <td>
                    <S.Situacao $ativo={cliente.ativo}>
                      {cliente.ativo ? 'Ativo' : 'Inativo'}
                    </S.Situacao>
                  </td>
                  <td>
                    <div className="acoes">
                      <S.BotaoIcone
                        type="button"
                        aria-label={`Ver ${cliente.nome}`}
                        onClick={() =>
                          router.push(`/admin/clientes/${cliente.id}`)
                        }
                      >
                        <FiEye size={16} />
                      </S.BotaoIcone>

                      {/* RF0023: inativar (e reativar) o cadastro. */}
                      <S.BotaoIcone
                        type="button"
                        $danger={cliente.ativo}
                        disabled={isPending}
                        aria-label={
                          cliente.ativo
                            ? `Inativar ${cliente.nome}`
                            : `Reativar ${cliente.nome}`
                        }
                        onClick={() => setEmSituacao(cliente)}
                      >
                        <FiPower size={16} />
                      </S.BotaoIcone>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </S.Tabela>
        </S.TabelaWrapper>
      )}
      <ConfirmarSituacaoCliente
        aberto={!!emSituacao}
        onClose={() => setEmSituacao(undefined)}
        cliente={emSituacao}
        acao={emSituacao?.ativo ? 'INATIVAR' : 'REATIVAR'}
        onConfirmar={confirmarSituacao}
        isPending={isPending}
      />
    </S.Container>
  );
};

export default AdminClientes;
