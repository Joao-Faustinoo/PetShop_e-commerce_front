/**
 * [VIEW] ProdutoForm
 *
 * O QUE FAZ: formulário de cadastro e alteração de produto.
 *
 * COMO FARÁ: react-hook-form com o ProdutoSchema. Reúne marca, categorias (múltipla),
 * espécie, porte, cor, material, nome, descrição, dimensões, código de
 * barras, grupo de precificação e valor de custo. Mostra o valor de venda
 * sugerido em tempo real e o aviso de autorização gerencial quando o valor
 * digitado cai abaixo da margem.
 *
 * ATENDE: RF0011, RF0014, RN0011, RN0012, RN0013, RN0014
 */

'use client';

import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import PrimaryButton from '@/components/Buttons/Primary/button';
import SecondaryButton from '@/components/Buttons/Secondary/button';
import { useDominiosController } from '@/controllers/dominios/useDominiosController';
import { usePrecificacaoController } from '@/controllers/produtos/usePrecificacaoController';
import { Produto } from '@/types/produtos/types';
import { formatCurrency } from '@/utils/formatCurrency';
import { IProdutoForm, ProdutoSchema } from '@/validations/ProdutoSchema';

import * as S from './styles';

interface ProdutoFormProps {
  produto?: Produto;
  onSubmit: (
    dados: IProdutoForm,
    precificacao: { valorVenda: number; autorizacaoGerente: boolean },
  ) => void;
  onCancelar: () => void;
  isPending?: boolean;
}

const ProdutoForm = ({
  produto,
  onSubmit,
  onCancelar,
  isPending,
}: ProdutoFormProps) => {
  const {
    marcas,
    categorias,
    especies,
    portes,
    cores,
    materiais,
    gruposPrecificacao,
  } = useDominiosController();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<IProdutoForm>({
    resolver: yupResolver(ProdutoSchema),
    defaultValues: {
      nome: produto?.nome ?? '',
      descricao: produto?.descricao ?? '',
      marcaId: produto?.marcaId ?? 1,
      categoriaIds: produto?.categoriaIds ?? [],
      especie: produto?.especie ?? 'CAO',
      porte: produto?.porte ?? 'M',
      corId: produto?.corId ?? 1,
      materialId: produto?.materialId ?? 1,
      altura: produto?.dimensoes.altura ?? undefined,
      largura: produto?.dimensoes.largura ?? undefined,
      peso: produto?.dimensoes.peso ?? undefined,
      profundidade: produto?.dimensoes.profundidade ?? undefined,
      codigoBarras: produto?.codigoBarras ?? '',
      grupoPrecificacaoId: produto?.grupoPrecificacaoId ?? 1,
      valorCusto: produto?.valorCusto ?? undefined,
    },
  });

  const valorCusto = Number(useWatch({ control, name: 'valorCusto' })) || 0;
  const grupoId = Number(useWatch({ control, name: 'grupoPrecificacaoId' }));

  // RN0013/RF0052: o sugerido é custo + margem do grupo escolhido.
  const { valorVendaSugerido, margemLucro, validarMargem } =
    usePrecificacaoController(valorCusto, grupoId);

  /**
   * RN0014: na alteração o admin pode digitar outro valor de venda. Abaixo
   * da margem, o envio exige a autorização do gerente de vendas.
   */
  const [valorVendaManual, setValorVendaManual] = useState<string>(
    produto ? String(produto.valorVenda) : '',
  );
  const [autorizacaoGerente, setAutorizacaoGerente] = useState(false);

  const valorVendaEfetivo = valorVendaManual
    ? Number(valorVendaManual)
    : valorVendaSugerido;

  const margem = validarMargem(valorVendaEfetivo);

  const submeter = (dados: IProdutoForm) =>
    onSubmit(dados, {
      valorVenda: valorVendaEfetivo,
      autorizacaoGerente,
    });

  return (
    <S.Form onSubmit={handleSubmit(submeter)}>
      <S.Secao>
        <legend>Identificação</legend>

        <S.Grid>
          <S.Campo $span={2}>
            <S.Label htmlFor="nome">Nome do produto</S.Label>
            <S.Input
              id="nome"
              placeholder="Ex.: Moletom Pet Cinza"
              $erro={!!errors.nome}
              {...register('nome')}
            />
            {errors.nome && <S.Erro>{errors.nome.message}</S.Erro>}
          </S.Campo>

          <S.Campo $span={2}>
            <S.Label htmlFor="descricao">Descrição</S.Label>
            <S.Textarea
              id="descricao"
              placeholder="Material, caimento, detalhes de acabamento..."
              $erro={!!errors.descricao}
              {...register('descricao')}
            />
            {errors.descricao && <S.Erro>{errors.descricao.message}</S.Erro>}
          </S.Campo>

          <S.Campo>
            <S.Label htmlFor="marcaId">Marca</S.Label>
            <S.Select
              id="marcaId"
              $erro={!!errors.marcaId}
              {...register('marcaId')}
            >
              {marcas.map(marca => (
                <option key={marca.id} value={marca.id}>
                  {marca.nome}
                </option>
              ))}
            </S.Select>
            {errors.marcaId && <S.Erro>{errors.marcaId.message}</S.Erro>}
          </S.Campo>

          <S.Campo>
            <S.Label htmlFor="codigoBarras">Código de barras</S.Label>
            <S.Input
              id="codigoBarras"
              inputMode="numeric"
              placeholder="7891000100011"
              $erro={!!errors.codigoBarras}
              {...register('codigoBarras')}
            />
            {errors.codigoBarras && (
              <S.Erro>{errors.codigoBarras.message}</S.Erro>
            )}
          </S.Campo>
        </S.Grid>

        {/* RN0012: um produto pode estar em mais de uma categoria. */}
        <S.Campo>
          <S.Label>Categorias</S.Label>
          <Controller
            name="categoriaIds"
            control={control}
            render={({ field }) => (
              <S.Opcoes>
                {categorias.map(categoria => {
                  const selecionadas = field.value ?? [];
                  const marcada = selecionadas.includes(categoria.id);

                  return (
                    <S.Checkbox key={categoria.id}>
                      <input
                        type="checkbox"
                        checked={marcada}
                        onChange={() =>
                          field.onChange(
                            marcada
                              ? selecionadas.filter(id => id !== categoria.id)
                              : [...selecionadas, categoria.id],
                          )
                        }
                      />
                      {categoria.nome}
                    </S.Checkbox>
                  );
                })}
              </S.Opcoes>
            )}
          />
          {errors.categoriaIds && (
            <S.Erro>{errors.categoriaIds.message}</S.Erro>
          )}
        </S.Campo>
      </S.Secao>

      {/* RN0011: espécie, porte, cor e material são obrigatórios. */}
      <S.Secao>
        <legend>Características</legend>

        <S.Grid>
          <S.Campo>
            <S.Label htmlFor="especie">Espécie de destino</S.Label>
            <S.Select
              id="especie"
              $erro={!!errors.especie}
              {...register('especie')}
            >
              {especies.map(especie => (
                <option key={especie.value} value={especie.value}>
                  {especie.label}
                </option>
              ))}
            </S.Select>
            {errors.especie && <S.Erro>{errors.especie.message}</S.Erro>}
          </S.Campo>

          <S.Campo>
            <S.Label htmlFor="porte">Porte / tamanho</S.Label>
            <S.Select id="porte" $erro={!!errors.porte} {...register('porte')}>
              {portes.map(porte => (
                <option key={porte.id} value={porte.sigla}>
                  {porte.nome}
                </option>
              ))}
            </S.Select>
            {errors.porte && <S.Erro>{errors.porte.message}</S.Erro>}
          </S.Campo>

          <S.Campo>
            <S.Label htmlFor="corId">Cor</S.Label>
            <S.Select id="corId" $erro={!!errors.corId} {...register('corId')}>
              {cores.map(cor => (
                <option key={cor.id} value={cor.id}>
                  {cor.nome}
                </option>
              ))}
            </S.Select>
            {errors.corId && <S.Erro>{errors.corId.message}</S.Erro>}
          </S.Campo>

          <S.Campo>
            <S.Label htmlFor="materialId">Material</S.Label>
            <S.Select
              id="materialId"
              $erro={!!errors.materialId}
              {...register('materialId')}
            >
              {materiais.map(material => (
                <option key={material.id} value={material.id}>
                  {material.nome}
                </option>
              ))}
            </S.Select>
            {errors.materialId && <S.Erro>{errors.materialId.message}</S.Erro>}
          </S.Campo>
        </S.Grid>
      </S.Secao>

      {/* RN0011: as quatro dimensões também são obrigatórias. */}
      <S.Secao>
        <legend>Dimensões</legend>

        <S.Grid $colunas={4}>
          <S.Campo>
            <S.Label htmlFor="altura">Altura (cm)</S.Label>
            <S.Input
              id="altura"
              type="number"
              step="0.1"
              $erro={!!errors.altura}
              {...register('altura')}
            />
            {errors.altura && <S.Erro>{errors.altura.message}</S.Erro>}
          </S.Campo>

          <S.Campo>
            <S.Label htmlFor="largura">Largura (cm)</S.Label>
            <S.Input
              id="largura"
              type="number"
              step="0.1"
              $erro={!!errors.largura}
              {...register('largura')}
            />
            {errors.largura && <S.Erro>{errors.largura.message}</S.Erro>}
          </S.Campo>

          <S.Campo>
            <S.Label htmlFor="profundidade">Profundidade (cm)</S.Label>
            <S.Input
              id="profundidade"
              type="number"
              step="0.1"
              $erro={!!errors.profundidade}
              {...register('profundidade')}
            />
            {errors.profundidade && (
              <S.Erro>{errors.profundidade.message}</S.Erro>
            )}
          </S.Campo>

          <S.Campo>
            <S.Label htmlFor="peso">Peso (kg)</S.Label>
            <S.Input
              id="peso"
              type="number"
              step="0.01"
              $erro={!!errors.peso}
              {...register('peso')}
            />
            {errors.peso && <S.Erro>{errors.peso.message}</S.Erro>}
          </S.Campo>
        </S.Grid>
      </S.Secao>

      <S.Secao>
        <legend>Precificação</legend>

        <S.Grid $colunas={3}>
          <S.Campo>
            <S.Label htmlFor="grupoPrecificacaoId">
              Grupo de precificação
            </S.Label>
            <S.Select
              id="grupoPrecificacaoId"
              $erro={!!errors.grupoPrecificacaoId}
              {...register('grupoPrecificacaoId')}
            >
              {gruposPrecificacao.map(grupo => (
                <option key={grupo.id} value={grupo.id}>
                  {grupo.nome} (+{grupo.margemLucro}%)
                </option>
              ))}
            </S.Select>
            {errors.grupoPrecificacaoId && (
              <S.Erro>{errors.grupoPrecificacaoId.message}</S.Erro>
            )}
          </S.Campo>

          <S.Campo>
            <S.Label htmlFor="valorCusto">Valor de custo (R$)</S.Label>
            <S.Input
              id="valorCusto"
              type="number"
              step="0.01"
              min={0.01}
              $erro={!!errors.valorCusto}
              {...register('valorCusto')}
            />
            {errors.valorCusto && <S.Erro>{errors.valorCusto.message}</S.Erro>}
          </S.Campo>

          <S.Campo>
            <S.Label htmlFor="valorVenda">Valor de venda (R$)</S.Label>
            <S.Input
              id="valorVenda"
              type="number"
              step="0.01"
              placeholder={String(valorVendaSugerido)}
              value={valorVendaManual}
              onChange={evento => setValorVendaManual(evento.target.value)}
            />
          </S.Campo>
        </S.Grid>

        {/* RN0013: o sugerido é recalculado em tempo real. */}
        <S.Aviso>
          Valor de venda sugerido pela margem de {margemLucro}%:{' '}
          <strong>{formatCurrency(valorVendaSugerido)}</strong>. Deixe o campo
          em branco para usar o sugerido.
        </S.Aviso>

        {/* RN0014: abaixo da margem exige autorização do gerente. */}
        {margem.exigeAutorizacaoGerente && (
          <>
            <S.Aviso $tipo="alerta">{margem.mensagem}</S.Aviso>

            <S.Checkbox>
              <input
                type="checkbox"
                checked={autorizacaoGerente}
                onChange={evento =>
                  setAutorizacaoGerente(evento.target.checked)
                }
              />
              Confirmo a autorização do gerente de vendas para este valor
            </S.Checkbox>
          </>
        )}
      </S.Secao>

      <S.Acoes>
        <SecondaryButton label="Cancelar" onClick={onCancelar} />
        <PrimaryButton
          type="submit"
          label={produto ? 'Salvar alterações' : 'Cadastrar produto'}
          loading={isPending}
          disabled={margem.exigeAutorizacaoGerente && !autorizacaoGerente}
        />
      </S.Acoes>
    </S.Form>
  );
};

export default ProdutoForm;
