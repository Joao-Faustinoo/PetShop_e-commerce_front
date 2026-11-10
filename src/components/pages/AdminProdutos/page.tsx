/**
 * [VIEW] Tela: Produtos
 *
 * O QUE FAZ: tabela de produtos do administrador, com busca, filtros e mudança de
 * situação.
 *
 * COMO FARÁ: consome o useProdutosController com o termo debounced e o
 * useSituacaoProdutoController para as ações. Cada linha traz SKU, nome,
 * categorias, preço, saldo e situação. Inativar e ativar abrem o modal
 * ConfirmarSituacao, que exige motivo e justificativa.
 *
 * ATENDE: RF0012, RF0013, RF0015, RF0016, RN0015, RN0016, RN0017
 */

'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiEdit2, FiPlus, FiPower } from 'react-icons/fi';

import PrimaryButton from '@/components/Buttons/Primary/button';
import SearchInput from '@/components/Inputs/SearchInput/input';
import ConfirmarSituacao from '@/components/Modals/ConfirmarSituacao';
import ModalConfirmacao from '@/components/Modals/Confirmacao';
import { useConfirmacao } from '@/components/Modals/Confirmacao/useConfirmacao';
import TabelaSkeleton from '@/components/skeletons/TabelaSkeleton';
import {
  nomeDoDominio,
  useDominiosController,
} from '@/controllers/dominios/useDominiosController';
import { useProdutosController } from '@/controllers/produtos/useProdutosController';
import { useSituacaoProdutoController } from '@/controllers/produtos/useSituacaoProdutoController';
import { useDebounce } from '@/hooks/useDebounce';
import { Especie } from '@/types/dominios/types';
import { Produto, ProdutoFiltros } from '@/types/produtos/types';
import { formatCurrency } from '@/utils/formatCurrency';

import * as S from './styles';

const AdminProdutos = () => {
  const router = useRouter();
  const { categorias, marcas, especies } = useDominiosController();
  const { propsDoModal, pedirConfirmacao } = useConfirmacao();

  const [busca, setBusca] = useState('');
  const buscaDebounced = useDebounce(busca);
  const [situacao, setSituacao] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [especie, setEspecie] = useState('');

  const [modal, setModal] = useState<{
    produto: Produto;
    acao: 'INATIVAR' | 'ATIVAR';
  }>();

  const filtros = useMemo<ProdutoFiltros>(
    () => ({
      nome: buscaDebounced || undefined,
      // O admin escolhe a situação; a vitrine fixa ativo.
      ativo: situacao === '' ? undefined : situacao === 'ativos',
      categoriaId: categoriaId ? Number(categoriaId) : undefined,
      especie: (especie as Especie) || undefined,
    }),
    [buscaDebounced, situacao, categoriaId, especie],
  );

  const { produtos, total, isLoading } = useProdutosController(filtros);

  return (
    <S.Container>
      <S.Cabecalho>
        <S.Titulo>
          <h1>Produtos</h1>
          <p>{total} produto(s) no catálogo</p>
        </S.Titulo>

        <S.Acoes>
          <PrimaryButton
            label="Novo produto"
            icon={<FiPlus size={16} />}
            onClick={() => router.push('/admin/produtos/novo')}
          />
        </S.Acoes>
      </S.Cabecalho>

      <S.Filtros $colunas={4}>
        <S.CampoFiltro $span={2}>
          <SearchInput
            value={busca}
            onChange={setBusca}
            placeholder="Buscar por nome ou SKU..."
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
          <label htmlFor="categoria">Categoria</label>
          <select
            id="categoria"
            value={categoriaId}
            onChange={evento => setCategoriaId(evento.target.value)}
          >
            <option value="">Todas</option>
            {categorias.map(item => (
              <option key={item.id} value={item.id}>
                {item.nome}
              </option>
            ))}
          </select>
        </S.CampoFiltro>

        <S.CampoFiltro>
          <label htmlFor="especie">Espécie</label>
          <select
            id="especie"
            value={especie}
            onChange={evento => setEspecie(evento.target.value)}
          >
            <option value="">Todas</option>
            {especies.map(item => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </S.CampoFiltro>
      </S.Filtros>

      {isLoading ? (
        <TabelaSkeleton colunas={7} />
      ) : produtos.length === 0 ? (
        <S.Vazio>
          <strong>Nenhum produto encontrado</strong>
          <p>Ajuste os filtros ou cadastre um novo produto.</p>
        </S.Vazio>
      ) : (
        <S.TabelaWrapper>
          <S.Tabela>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Produto</th>
                <th>Marca</th>
                <th>Categorias</th>
                <th className="numero">Preço</th>
                <th className="numero">Saldo</th>
                <th>Situação</th>
                <th aria-label="Ações" />
              </tr>
            </thead>

            <tbody>
              {produtos.map(produto => (
                <tr key={produto.id}>
                  <td>{produto.sku}</td>
                  <td>{produto.nome}</td>
                  <td>{nomeDoDominio(marcas, produto.marcaId)}</td>
                  <td>
                    {produto.categoriaIds
                      .map(id => nomeDoDominio(categorias, id))
                      .join(', ')}
                  </td>
                  <td className="numero">
                    {formatCurrency(produto.valorVenda)}
                  </td>
                  <td className="numero">{produto.quantidadeEstoque}</td>
                  <td>
                    <S.Situacao $ativo={produto.ativo}>
                      {produto.ativo ? 'Ativo' : 'Inativo'}
                    </S.Situacao>
                  </td>
                  <td>
                    <div className="acoes">
                      <S.BotaoIcone
                        type="button"
                        aria-label={`Editar ${produto.nome}`}
                        onClick={() =>
                          router.push(`/admin/produtos/${produto.id}`)
                        }
                      >
                        <FiEdit2 size={16} />
                      </S.BotaoIcone>

                      {/* RN0015/RN0017: motivo e justificativa no modal. */}
                      <S.BotaoIcone
                        type="button"
                        $danger={produto.ativo}
                        aria-label={
                          produto.ativo
                            ? `Inativar ${produto.nome}`
                            : `Ativar ${produto.nome}`
                        }
                        onClick={() =>
                          setModal({
                            produto,
                            acao: produto.ativo ? 'INATIVAR' : 'ATIVAR',
                          })
                        }
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

      <ConfirmarSituacao
        aberto={!!modal}
        produto={modal?.produto}
        acao={modal?.acao ?? 'INATIVAR'}
        onClose={() => setModal(undefined)}
      />

      <ModalConfirmacao {...propsDoModal} />
    </S.Container>
  );
};

export default AdminProdutos;
