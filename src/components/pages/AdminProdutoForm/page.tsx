/**
 * [VIEW] Tela: Cadastro de produto
 *
 * O QUE FAZ: formulário único de cadastro e alteração de produto.
 *
 * COMO FARÁ: a mesma tela atende /admin/produtos/novo e /admin/produtos/[id]; havendo
 * id, carrega o produto pelo useProdutoController. Os selects vêm do
 * useDominiosController. Exige todos os campos da RN0011 e permite mais de
 * uma categoria (RN0012). O valor de venda é sugerido pelo
 * usePrecificacaoController a partir do custo e do grupo de precificação, e
 * um valor abaixo da margem exibe o aviso de autorização gerencial.
 *
 * ATENDE: RF0011, RF0014, RF0052, RN0011-RN0014
 */

'use client';

import { useParams, useRouter } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';

import ProdutoForm from '@/components/Forms/ProdutoForm/ProdutoForm';
import { useProdutoController } from '@/controllers/produtos/useProdutoController';
import { useProdutoFormController } from '@/controllers/produtos/useProdutoFormController';
import { Especie, PorteSigla } from '@/types/dominios/types';

import * as S from './styles';

const AdminProdutoForm = () => {
  const router = useRouter();
  // A rota /novo não tem [id]; a de edição tem.
  const { id } = useParams<{ id?: string }>();

  const { produto, isLoading } = useProdutoController(
    id ? Number(id) : undefined,
  );
  const { criar, alterar, isPending, modoEdicao } =
    useProdutoFormController(produto);

  if (id && isLoading) {
    return (
      <S.Container>
        <S.Vazio>
          <strong>Carregando produto...</strong>
        </S.Vazio>
      </S.Container>
    );
  }

  return (
    <S.Container>
      <S.Voltar type="button" onClick={() => router.push('/admin/produtos')}>
        <FiArrowLeft size={16} /> Voltar para produtos
      </S.Voltar>

      <S.Cabecalho>
        <S.Titulo>
          <h1>{modoEdicao ? `Editar ${produto?.sku}` : 'Novo produto'}</h1>
          <p>
            Todos os campos são obrigatórios; o produto pode pertencer a mais de
            uma categoria.
          </p>
        </S.Titulo>
      </S.Cabecalho>

      <S.Painel>
        <ProdutoForm
          produto={produto}
          isPending={isPending}
          onCancelar={() => router.push('/admin/produtos')}
          onSubmit={(dados, precificacao) => {
            const payload = {
              nome: dados.nome,
              descricao: dados.descricao,
              marcaId: dados.marcaId,
              categoriaIds: dados.categoriaIds,
              especie: dados.especie as Especie,
              porte: dados.porte as PorteSigla,
              corId: dados.corId,
              materialId: dados.materialId,
              dimensoes: {
                altura: dados.altura,
                largura: dados.largura,
                peso: dados.peso,
                profundidade: dados.profundidade,
              },
              codigoBarras: dados.codigoBarras,
              grupoPrecificacaoId: dados.grupoPrecificacaoId,
              valorCusto: dados.valorCusto,
            };

            if (produto) {
              // RN0014: o valor manual e a autorização vêm do formulário.
              alterar({
                ...payload,
                id: produto.id,
                valorVenda: precificacao.valorVenda,
                autorizacaoGerente: precificacao.autorizacaoGerente,
              });
            } else {
              criar(payload);
            }
          }}
        />
      </S.Painel>
    </S.Container>
  );
};

export default AdminProdutoForm;
