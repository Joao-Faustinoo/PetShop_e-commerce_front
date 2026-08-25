/**
 * [VIEW] Tela: Pedidos
 *
 * O QUE FAZ: gestão de pedidos pelo administrador: despachar e confirmar entrega.
 *
 * COMO FARÁ: consome o usePedidosController com filtro por status e período, e o
 * useStatusPedidoController para as ações. Permite selecionar vendas
 * APROVADA em lote para despachar (vão a EM TRANSPORTE) e confirmar a
 * entrega das que estão EM TRANSPORTE (vão a ENTREGUE).
 *
 * ATENDE: RF0039, RF0040, RN0039, RN0040
 */

'use client';

import { useMemo, useState } from 'react';
import { FiCheckCircle, FiTruck } from 'react-icons/fi';

import PrimaryButton from '@/components/Buttons/Primary/button';
import SecondaryButton from '@/components/Buttons/Secondary/button';
import PedidoCard from '@/components/Cards/PedidoCard';
import ModalConfirmacao from '@/components/Modals/Confirmacao';
import { useConfirmacao } from '@/components/Modals/Confirmacao/useConfirmacao';
import TabelaSkeleton from '@/components/skeletons/TabelaSkeleton';
import { usePedidosController } from '@/controllers/pedidos/usePedidosController';
import { useStatusPedidoController } from '@/controllers/pedidos/useStatusPedidoController';
import {
  PedidoFiltros,
  ROTULO_STATUS,
  StatusPedido,
} from '@/types/pedidos/types';

import * as S from './styles';

const statusDisponiveis = Object.keys(ROTULO_STATUS) as StatusPedido[];

const AdminPedidos = () => {
  const [status, setStatus] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [selecionados, setSelecionados] = useState<number[]>([]);

  const filtros = useMemo<PedidoFiltros>(
    () => ({
      status: (status as StatusPedido) || undefined,
      dataInicio: dataInicio || undefined,
      dataFim: dataFim || undefined,
    }),
    [status, dataInicio, dataFim],
  );

  const { pedidos, isLoading } = usePedidosController(filtros);
  const { propsDoModal, pedirConfirmacao } = useConfirmacao();
  const { despachar, confirmarEntrega, isPending } =
    useStatusPedidoController();

  // RF0039: o despacho em lote só alcança as compras aprovadas.
  const aprovados = pedidos.filter(pedido => pedido.podeDespachar);
  const selecionadosValidos = aprovados.filter(pedido =>
    selecionados.includes(pedido.id),
  );

  const alternar = (pedidoId: number) => {
    setSelecionados(atuais =>
      atuais.includes(pedidoId)
        ? atuais.filter(id => id !== pedidoId)
        : [...atuais, pedidoId],
    );
  };

  const despacharSelecionados = () => {
    selecionadosValidos.forEach(pedido => despachar(pedido));
    setSelecionados([]);
  };

  return (
    <S.Container>
      <S.Cabecalho>
        <S.Titulo>
          <h1>Pedidos</h1>
          <p>{pedidos.length} pedido(s) no filtro atual</p>
        </S.Titulo>

        {/* RF0039: seleção em lote das vendas aprovadas. */}
        {selecionadosValidos.length > 0 && (
          <PrimaryButton
            label={`Despachar ${selecionadosValidos.length} pedido(s)`}
            icon={<FiTruck size={16} />}
            loading={isPending}
            onClick={() =>
              pedirConfirmacao({
                variante: 'alerta',
                titulo: 'Despachar em lote',
                mensagem: `${selecionadosValidos.length} pedido(s) passarão para EM TRANSPORTE de uma vez. A situação não volta atrás.`,
                rotuloConfirmar: 'Despachar todos',
                aoConfirmar: despacharSelecionados,
              })
            }
          />
        )}
      </S.Cabecalho>

      <S.Filtros $colunas={4}>
        <S.CampoFiltro>
          <label htmlFor="status">Situação</label>
          <select
            id="status"
            value={status}
            onChange={evento => setStatus(evento.target.value)}
          >
            <option value="">Todas</option>
            {statusDisponiveis.map(item => (
              <option key={item} value={item}>
                {ROTULO_STATUS[item]}
              </option>
            ))}
          </select>
        </S.CampoFiltro>

        <S.CampoFiltro>
          <label htmlFor="dataInicio">De</label>
          <input
            id="dataInicio"
            type="date"
            value={dataInicio}
            onChange={evento => setDataInicio(evento.target.value)}
          />
        </S.CampoFiltro>

        <S.CampoFiltro>
          <label htmlFor="dataFim">Até</label>
          <input
            id="dataFim"
            type="date"
            value={dataFim}
            onChange={evento => setDataFim(evento.target.value)}
          />
        </S.CampoFiltro>
      </S.Filtros>

      {isLoading ? (
        <TabelaSkeleton colunas={4} linhas={5} />
      ) : pedidos.length === 0 ? (
        <S.Vazio>
          <strong>Nenhum pedido encontrado</strong>
          <p>Ajuste o filtro de situação ou de período.</p>
        </S.Vazio>
      ) : (
        <S.Lista>
          {pedidos.map(pedido => (
            <S.LinhaPedido key={pedido.id}>
              {/* Só as aprovadas entram na seleção em lote. */}
              <input
                type="checkbox"
                aria-label={`Selecionar ${pedido.numero}`}
                disabled={!pedido.podeDespachar}
                checked={selecionados.includes(pedido.id)}
                onChange={() => alternar(pedido.id)}
              />

              <PedidoCard
                pedido={pedido}
                mostrarCliente
                acoes={
                  <>
                    {/* RF0039/RN0039: APROVADA vira EM TRANSPORTE. */}
                    {pedido.podeDespachar && (
                      <SecondaryButton
                        label="Despachar"
                        icon={<FiTruck size={15} />}
                        disabled={isPending}
                        onClick={() =>
                          pedirConfirmacao({
                            variante: 'info',
                            titulo: 'Despachar pedido',
                            mensagem: `O ${pedido.numero} passará para EM TRANSPORTE e o cliente será notificado. A situação não volta atrás.`,
                            rotuloConfirmar: 'Despachar',
                            aoConfirmar: () => despachar(pedido),
                          })
                        }
                      />
                    )}

                    {/* RF0040/RN0040: EM TRANSPORTE vira ENTREGUE. */}
                    {pedido.podeConfirmarEntrega && (
                      <SecondaryButton
                        label="Confirmar entrega"
                        icon={<FiCheckCircle size={15} />}
                        disabled={isPending}
                        onClick={() =>
                          pedirConfirmacao({
                            variante: 'info',
                            titulo: 'Confirmar entrega',
                            mensagem: `O ${pedido.numero} passará para ENTREGUE. A partir daí o cliente pode solicitar troca dos itens.`,
                            rotuloConfirmar: 'Confirmar',
                            aoConfirmar: () => confirmarEntrega(pedido),
                          })
                        }
                      />
                    )}
                  </>
                }
              />
            </S.LinhaPedido>
          ))}
        </S.Lista>
      )}

      <ModalConfirmacao {...propsDoModal} />
    </S.Container>
  );
};

export default AdminPedidos;
