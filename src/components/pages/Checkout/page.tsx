/**
 * [VIEW] Tela: Checkout
 *
 * O QUE FAZ: conduz o cliente pelas etapas de endereço, frete e pagamento até a
 * finalização da compra.
 *
 * COMO FARÁ: orquestra as etapas com o useCheckoutController. Etapa 1: escolher
 * endereço de entrega ou cadastrar um novo com a opção de salvar no perfil.
 * Etapa 2: frete calculado pelo useFreteController. Etapa 3: pagamento com
 * cartões e cupons, exibindo em tempo real quanto falta cobrir. Finalizar
 * só habilita com o total coberto.
 *
 * ATENDE: RF0033-RF0038, RN0033-RN0038
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiPlus, FiTrash2, FiTruck } from 'react-icons/fi';

import PrimaryButton from '@/components/Buttons/Primary/button';
import SecondaryButton from '@/components/Buttons/Secondary/button';
import ResumoCard from '@/components/Cards/ResumoCard';
import AdicionarCartao from '@/components/Modals/AdicionarCartao';
import AdicionarEndereco from '@/components/Modals/AdicionarEndereco';
import { useCheckoutController } from '@/controllers/checkout/useCheckoutController';
import { VALOR_MINIMO_POR_CARTAO } from '@/controllers/checkout/usePagamentoController';
import {
  nomeDoDominio,
  useDominiosController,
} from '@/controllers/dominios/useDominiosController';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import { mascararCartao } from '@/utils/masks';

import * as S from './styles';

const Checkout = () => {
  const router = useRouter();
  const { bandeiras } = useDominiosController();

  const {
    itens,
    subtotal,
    frete,
    cupom,
    pagamento,
    totalComFrete,
    podeFinalizar,
    finalizarCompra,
    isPending,
  } = useCheckoutController();

  const [modalEndereco, setModalEndereco] = useState(false);
  const [modalCartao, setModalCartao] = useState(false);

  const [codigoCupom, setCodigoCupom] = useState('');
  const [cartaoSelecionado, setCartaoSelecionado] = useState<number>();
  const [valorCartao, setValorCartao] = useState('');

  if (itens.length === 0) {
    return (
      <S.Container>
        <S.Vazio>
          <strong>Não há itens para finalizar</strong>
          <p>Adicione produtos ao carrinho antes de ir para o checkout.</p>
          <SecondaryButton
            label="Ir para o catálogo"
            onClick={() => router.push('/produtos')}
          />
        </S.Vazio>
      </S.Container>
    );
  }

  return (
    <S.Container>
      <S.Cabecalho>
        <S.Titulo>
          <h1>Finalizar compra</h1>
          <p>Confirme o endereço, o frete e a forma de pagamento</p>
        </S.Titulo>
      </S.Cabecalho>

      <S.DuasColunas>
        <div>
          {/* Etapa 1 — RF0035: endereço já cadastrado ou um novo. */}
          <S.Etapa>
            <S.TituloEtapa>
              <span>1</span>
              <h2>Endereço de entrega</h2>
              <SecondaryButton
                label="Novo endereço"
                icon={<FiPlus size={15} />}
                onClick={() => setModalEndereco(true)}
              />
            </S.TituloEtapa>

            {frete.enderecos.length === 0 ? (
              <S.Alerta $tipo="alerta">
                Você ainda não tem endereço de entrega cadastrado.
              </S.Alerta>
            ) : (
              <S.Opcoes>
                {frete.enderecos.map(endereco => (
                  <S.Opcao
                    key={endereco.id}
                    $selecionada={frete.enderecoSelecionado?.id === endereco.id}
                  >
                    <input
                      type="radio"
                      name="endereco"
                      checked={frete.enderecoSelecionado?.id === endereco.id}
                      onChange={() => frete.selecionarEndereco(endereco.id)}
                    />
                    <div>
                      <strong>{endereco.apelido}</strong>
                      <small>
                        {endereco.logradouro}, {endereco.numero} ·{' '}
                        {endereco.bairro} · {endereco.cidade}/{endereco.estado}{' '}
                        · CEP {endereco.cep}
                      </small>
                    </div>
                  </S.Opcao>
                ))}
              </S.Opcoes>
            )}
          </S.Etapa>

          {/* Etapa 2 — RF0034: frete pelos itens e pelo endereço. */}
          <S.Etapa>
            <S.TituloEtapa>
              <span>2</span>
              <h2>Frete</h2>
            </S.TituloEtapa>

            <S.Aplicado>
              <FiTruck size={17} />
              {frete.enderecoSelecionado
                ? `Entrega para ${frete.enderecoSelecionado.cidade}/${frete.enderecoSelecionado.estado}`
                : 'Selecione um endereço para calcular o frete'}
              <strong>
                {frete.isLoading
                  ? 'Calculando...'
                  : formatCurrency(frete.frete)}
              </strong>
            </S.Aplicado>
          </S.Etapa>

          {/* Etapa 3 — RF0037/RN0033/RN0035/RN0036: cupons. */}
          <S.Etapa>
            <S.TituloEtapa>
              <span>3</span>
              <h2>Cupons</h2>
            </S.TituloEtapa>

            {cupom.cuponsAplicados.length > 0 && (
              <S.Aplicados>
                {cupom.cuponsAplicados.map(
                  ({ cupom: aplicado, valorConsumido }) => (
                    <S.Aplicado key={aplicado.codigo} $tipo="cupom">
                      {aplicado.codigo} (
                      {aplicado.tipo === 'TROCA' ? 'troca' : 'promocional'})
                      <strong>- {formatCurrency(valorConsumido)}</strong>
                      <S.BotaoIcone
                        type="button"
                        $danger
                        aria-label={`Remover cupom ${aplicado.codigo}`}
                        onClick={() => cupom.removerCupom(aplicado.codigo)}
                      >
                        <FiTrash2 size={15} />
                      </S.BotaoIcone>
                    </S.Aplicado>
                  ),
                )}
              </S.Aplicados>
            )}

            <S.LinhaCupom>
              <div>
                <label htmlFor="cupom">Código do cupom</label>
                <input
                  id="cupom"
                  placeholder="Ex.: BEMVINDO10"
                  value={codigoCupom}
                  onChange={evento => setCodigoCupom(evento.target.value)}
                />
              </div>

              <SecondaryButton
                label="Aplicar"
                disabled={!codigoCupom.trim()}
                onClick={async () => {
                  await cupom.aplicarCupom(codigoCupom);
                  setCodigoCupom('');
                }}
              />
            </S.LinhaCupom>

            {cupom.disponiveis.length > 0 && (
              <S.Disponiveis>
                {cupom.disponiveis.map(disponivel => (
                  <S.CupomChip
                    key={disponivel.codigo}
                    type="button"
                    disabled={cupom.cuponsAplicados.some(
                      c => c.cupom.codigo === disponivel.codigo,
                    )}
                    onClick={() => cupom.aplicarCupom(disponivel.codigo)}
                  >
                    {disponivel.codigo} · {formatCurrency(disponivel.valor)} ·
                    até {formatDate(disponivel.validade)}
                  </S.CupomChip>
                ))}
              </S.Disponiveis>
            )}

            {/* RN0033: só um promocional por compra. */}
            <S.Alerta $tipo="info">
              Apenas um cupom promocional pode ser usado por compra. Cupons de
              troca podem ser combinados.
            </S.Alerta>
          </S.Etapa>

          {/* Etapa 4 — RF0036/RN0034/RN0035: cartões. */}
          <S.Etapa>
            <S.TituloEtapa>
              <span>4</span>
              <h2>Pagamento no cartão</h2>
              <SecondaryButton
                label="Novo cartão"
                icon={<FiPlus size={15} />}
                onClick={() => setModalCartao(true)}
              />
            </S.TituloEtapa>

            {cupom.valorRestante === 0 ? (
              <S.Alerta $tipo="info">
                Os cupons aplicados já cobrem o total da compra. Não é
                necessário informar cartão.
              </S.Alerta>
            ) : (
              <>
                {pagamento.pagamentos.length > 0 && (
                  <S.Aplicados>
                    {pagamento.pagamentos.map(linha => {
                      const cartao = pagamento.cartoes.find(
                        c => c.id === linha.cartaoId,
                      );

                      return (
                        <S.Aplicado key={linha.cartaoId} $tipo="cartao">
                          {mascararCartao(cartao?.numero ?? '')} ·{' '}
                          {nomeDoDominio(bandeiras, cartao?.bandeiraId)}
                          <strong>{formatCurrency(linha.valor)}</strong>
                          <S.BotaoIcone
                            type="button"
                            $danger
                            aria-label="Remover cartão do pagamento"
                            onClick={() =>
                              pagamento.removerPagamento(linha.cartaoId)
                            }
                          >
                            <FiTrash2 size={15} />
                          </S.BotaoIcone>
                        </S.Aplicado>
                      );
                    })}
                  </S.Aplicados>
                )}

                {pagamento.valorPendente > 0 && (
                  <S.ValorCartao>
                    <div>
                      <label htmlFor="cartao">Cartão</label>
                      <select
                        id="cartao"
                        value={cartaoSelecionado ?? ''}
                        onChange={evento =>
                          setCartaoSelecionado(Number(evento.target.value))
                        }
                      >
                        <option value="">Selecione</option>
                        {pagamento.cartoes
                          .filter(
                            cartao =>
                              !pagamento.pagamentos.some(
                                p => p.cartaoId === cartao.id,
                              ),
                          )
                          .map(cartao => (
                            <option key={cartao.id} value={cartao.id}>
                              {mascararCartao(cartao.numero)}
                              {cartao.preferencial ? ' (preferencial)' : ''}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="valorCartao">Valor (R$)</label>
                      <input
                        id="valorCartao"
                        type="number"
                        step="0.01"
                        min={0}
                        placeholder={pagamento.valorPendente.toFixed(2)}
                        value={valorCartao}
                        onChange={evento => setValorCartao(evento.target.value)}
                      />
                    </div>

                    <SecondaryButton
                      label="Adicionar"
                      disabled={!cartaoSelecionado}
                      onClick={() => {
                        if (!cartaoSelecionado) return;

                        pagamento.adicionarPagamento(
                          cartaoSelecionado,
                          Number(valorCartao) || pagamento.valorPendente,
                        );
                        setCartaoSelecionado(undefined);
                        setValorCartao('');
                      }}
                    />
                  </S.ValorCartao>
                )}

                {/* RN0034 e a exceção da RN0035. */}
                <S.Alerta $tipo="info">
                  A compra pode ser dividida em mais de um cartão, com no mínimo{' '}
                  {formatCurrency(VALOR_MINIMO_POR_CARTAO)} em cada. Com cupom
                  aplicado, o valor restante no cartão pode ficar abaixo desse
                  mínimo.
                </S.Alerta>
              </>
            )}
          </S.Etapa>
        </div>

        <ResumoCard
          subtotal={subtotal}
          frete={frete.frete}
          desconto={cupom.valorCobertoPorCupons}
          total={totalComFrete}
          troco={cupom.troco}
          valorPendente={pagamento.valorPendente}
          acoes={
            <>
              <PrimaryButton
                label="Finalizar compra"
                full
                loading={isPending}
                disabled={!podeFinalizar}
                onClick={() => finalizarCompra()}
              />
              <SecondaryButton
                label="Voltar ao carrinho"
                full
                onClick={() => router.push('/carrinho')}
              />
            </>
          }
        />
      </S.DuasColunas>

      {/* RF0035: novo endereço durante o checkout. */}
      <AdicionarEndereco
        aberto={modalEndereco}
        tipoFixo="ENTREGA"
        isPending={frete.salvandoEndereco}
        ofereceSalvarNoPerfil
        onClose={() => setModalEndereco(false)}
        onSubmit={dados => {
          frete.cadastrarEndereco(
            { ...dados, tipo: 'ENTREGA' },
            { onSuccess: () => setModalEndereco(false) },
          );
        }}
      />

      {/* RF0036: novo cartão durante o checkout. */}
      <AdicionarCartao
        aberto={modalCartao}
        isPending={pagamento.salvandoCartao}
        ofereceSalvarNoPerfil
        onClose={() => setModalCartao(false)}
        onSubmit={dados => {
          pagamento.cadastrarCartao(dados, {
            onSuccess: () => setModalCartao(false),
          });
        }}
      />
    </S.Container>
  );
};

export default Checkout;
