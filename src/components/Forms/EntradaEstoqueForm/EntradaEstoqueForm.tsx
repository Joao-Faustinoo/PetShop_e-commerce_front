/**
 * [VIEW] EntradaEstoqueForm
 *
 * O QUE FAZ: formulário de entrada de itens em estoque.
 *
 * COMO FARÁ: react-hook-form com o EntradaEstoqueSchema. Campos de produto,
 * quantidade (mínimo 1), valor de custo, fornecedor e data de entrada,
 * todos obrigatórios. Avisa quando a entrada tem custo maior que o vigente,
 * pois isso reprecifica todo o saldo do produto.
 *
 * ATENDE: RF0051, RN0050, RN0051, RN0061, RN0062, RNF0064
 */

'use client';

import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import PrimaryButton from '@/components/Buttons/Primary/button';
import SecondaryButton from '@/components/Buttons/Secondary/button';
import { useDominiosController } from '@/controllers/dominios/useDominiosController';
import { Produto } from '@/types/produtos/types';
import { formatCurrency } from '@/utils/formatCurrency';
import { hojeISO } from '@/utils/formatDate';
import {
  EntradaEstoqueSchema,
  IEntradaEstoqueForm,
} from '@/validations/EntradaEstoqueSchema';

import * as S from './styles';

interface EntradaEstoqueFormProps {
  produtos: Produto[];
  onSubmit: (dados: IEntradaEstoqueForm) => void;
  onCancelar: () => void;
  isPending?: boolean;
}

const EntradaEstoqueForm = ({
  produtos,
  onSubmit,
  onCancelar,
  isPending,
}: EntradaEstoqueFormProps) => {
  const { fornecedores, gruposPrecificacao } = useDominiosController();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<IEntradaEstoqueForm>({
    resolver: yupResolver(EntradaEstoqueSchema),
    defaultValues: {
      produtoId: produtos[0]?.id,
      quantidade: 1,
      valorCusto: undefined,
      fornecedorId: fornecedores[0]?.id ?? 1,
      // RNF0064: já nasce preenchida com hoje, mas continua obrigatória.
      dataEntrada: hojeISO(),
    },
  });

  const produtoId = useWatch({ control, name: 'produtoId' });
  const valorCusto = useWatch({ control, name: 'valorCusto' });

  const produto = produtos.find(p => p.id === Number(produtoId));
  const grupo = gruposPrecificacao.find(
    g => g.id === produto?.grupoPrecificacaoId,
  );

  /**
   * RN0051: custo maior que o vigente passa a valer para todo o saldo do
   * produto, e o valor de venda é recalculado sobre ele.
   */
  const custoInformado = Number(valorCusto) || 0;
  const reprecifica = !!produto && custoInformado > produto.valorCusto;
  const novoValorVenda =
    reprecifica && grupo
      ? Number((custoInformado * (1 + grupo.margemLucro / 100)).toFixed(2))
      : 0;

  return (
    <S.Form id="entrada-estoque-form" onSubmit={handleSubmit(onSubmit)}>
      <S.Grid>
        <S.Campo $span={2}>
          <S.Label htmlFor="produtoId">Produto</S.Label>
          <S.Select
            id="produtoId"
            $erro={!!errors.produtoId}
            {...register('produtoId')}
          >
            {produtos.map(item => (
              <option key={item.id} value={item.id}>
                {item.sku} — {item.nome}
              </option>
            ))}
          </S.Select>
          {errors.produtoId && <S.Erro>{errors.produtoId.message}</S.Erro>}
        </S.Campo>

        {/* RN0061: quantidade tem de ser maior que zero. */}
        <S.Campo>
          <S.Label htmlFor="quantidade">Quantidade</S.Label>
          <S.Input
            id="quantidade"
            type="number"
            min={1}
            step={1}
            $erro={!!errors.quantidade}
            {...register('quantidade')}
          />
          {errors.quantidade && <S.Erro>{errors.quantidade.message}</S.Erro>}
        </S.Campo>

        {/* RN0062: todo item precisa ter valor de custo. */}
        <S.Campo>
          <S.Label htmlFor="valorCusto">Valor de custo (R$)</S.Label>
          <S.Input
            id="valorCusto"
            type="number"
            min={0.01}
            step="0.01"
            placeholder="0,00"
            $erro={!!errors.valorCusto}
            {...register('valorCusto')}
          />
          {errors.valorCusto && <S.Erro>{errors.valorCusto.message}</S.Erro>}
        </S.Campo>

        <S.Campo>
          <S.Label htmlFor="fornecedorId">Fornecedor</S.Label>
          <S.Select
            id="fornecedorId"
            $erro={!!errors.fornecedorId}
            {...register('fornecedorId')}
          >
            {fornecedores.map(fornecedor => (
              <option key={fornecedor.id} value={fornecedor.id}>
                {fornecedor.nome}
              </option>
            ))}
          </S.Select>
          {errors.fornecedorId && (
            <S.Erro>{errors.fornecedorId.message}</S.Erro>
          )}
        </S.Campo>

        <S.Campo>
          <S.Label htmlFor="dataEntrada">Data de entrada</S.Label>
          <S.Input
            id="dataEntrada"
            type="date"
            max={hojeISO()}
            $erro={!!errors.dataEntrada}
            {...register('dataEntrada')}
          />
          {errors.dataEntrada && <S.Erro>{errors.dataEntrada.message}</S.Erro>}
        </S.Campo>
      </S.Grid>

      {produto && (
        <S.Aviso>
          Saldo atual de <strong>{produto.nome}</strong>:{' '}
          {produto.quantidadeEstoque} item(ns). Custo vigente{' '}
          {formatCurrency(produto.valorCusto)} · venda{' '}
          {formatCurrency(produto.valorVenda)}.
        </S.Aviso>
      )}

      {reprecifica && (
        <S.Aviso $tipo="alerta">
          O custo informado é maior que o vigente. Pela RN0051, todos os itens
          deste produto passarão a valer{' '}
          <strong>{formatCurrency(custoInformado)}</strong> de custo, e o valor
          de venda será recalculado para{' '}
          <strong>{formatCurrency(novoValorVenda)}</strong>.
        </S.Aviso>
      )}

      <S.Acoes>
        <SecondaryButton label="Cancelar" onClick={onCancelar} />
        <PrimaryButton
          type="submit"
          label="Registrar entrada"
          loading={isPending}
        />
      </S.Acoes>
    </S.Form>
  );
};

export default EntradaEstoqueForm;
