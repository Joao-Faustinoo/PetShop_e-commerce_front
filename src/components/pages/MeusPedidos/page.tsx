/**
 * [VIEW] Tela: Meus pedidos
 *
 * O QUE FAZ: lista o histórico de compras do cliente logado.
 *
 * COMO FARÁ: consome o usePedidosController já restrito ao cliente pela sessão. Cada
 * linha mostra número, data, total e um badge de status. Só pedidos
 * ENTREGUE oferecem o atalho de solicitar troca (RN0043).
 *
 * No topo ficam os avisos ainda não lidos — é aqui que o cliente RECEBE a
 * notificação de que a troca foi autorizada (RNF0046), em vez de precisar
 * perceber sozinho que o status mudou.
 *
 * ATENDE: RF0025, RF0041, RN0043, RNF0046
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiEye, FiRefreshCw } from 'react-icons/fi';

import SecondaryButton from '@/components/Buttons/Secondary/button';
import PedidoCard from '@/components/Cards/PedidoCard';
import SolicitarTroca from '@/components/Modals/SolicitarTroca';
import TabelaSkeleton from '@/components/skeletons/TabelaSkeleton';
import { useNotificacoesController } from '@/controllers/notificacoes/useNotificacoesController';
import { usePedidosController } from '@/controllers/pedidos/usePedidosController';
import { Pedido, ROTULO_STATUS, StatusPedido } from '@/types/pedidos/types';

import * as S from './styles';

const statusDisponiveis = Object.keys(ROTULO_STATUS) as StatusPedido[];

const MeusPedidos = () => {
  const router = useRouter();
  const [status, setStatus] = useState('');
  const [pedidoParaTroca, setPedidoParaTroca] = useState<Pedido>();

  const { pedidos, isLoading } = usePedidosController(
    status ? { status: status as StatusPedido } : {},
  );
  const { naoLidas, marcarComoLida } = useNotificacoesController();

  return (
    <S.Container>
      <S.Cabecalho>
        <S.Titulo>
          <h1>Meus pedidos</h1>
          <p>Acompanhe suas compras e solicite trocas</p>
        </S.Titulo>
      </S.Cabecalho>

      {/* RNF0046: a autorização da troca chega como aviso ao cliente. */}
      {naoLidas.length > 0 && (
        <S.Avisos data-cy="notificacoes">
          {naoLidas.map(aviso => (
            <S.Aviso key={aviso.id}>
              <span>{aviso.mensagem}</span>
              <button type="button" onClick={() => marcarComoLida(aviso.id)}>
                Marcar como lida
              </button>
            </S.Aviso>
          ))}
        </S.Avisos>
      )}

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
      </S.Filtros>

      {isLoading ? (
        <TabelaSkeleton colunas={4} linhas={4} />
      ) : pedidos.length === 0 ? (
        <S.Vazio>
          <strong>Nenhum pedido por aqui</strong>
          <p>
            Quando você finalizar uma compra, ela aparece nesta lista com o
            status de acompanhamento.
          </p>
          <SecondaryButton
            label="Ir para o catálogo"
            onClick={() => router.push('/produtos')}
          />
        </S.Vazio>
      ) : (
        <S.Lista>
          {pedidos.map(pedido => (
            <PedidoCard
              key={pedido.id}
              pedido={pedido}
              acoes={
                <>
                  <SecondaryButton
                    label="Ver detalhes"
                    icon={<FiEye size={15} />}
                    onClick={() => router.push(`/meus-pedidos/${pedido.id}`)}
                  />

                  {/* RN0043: troca só a partir de pedido ENTREGUE. */}
                  {pedido.podeSolicitarTroca && (
                    <SecondaryButton
                      label="Solicitar troca"
                      icon={<FiRefreshCw size={15} />}
                      onClick={() => setPedidoParaTroca(pedido)}
                    />
                  )}
                </>
              }
            />
          ))}
        </S.Lista>
      )}

      <SolicitarTroca
        aberto={!!pedidoParaTroca}
        pedido={pedidoParaTroca}
        onClose={() => setPedidoParaTroca(undefined)}
      />
    </S.Container>
  );
};

export default MeusPedidos;
