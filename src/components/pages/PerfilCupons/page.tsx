/**
 * [VIEW] Tela: Meus cupons
 *
 * O QUE FAZ: lista os cupons de troca e promocionais disponíveis para o cliente.
 *
 * COMO FARÁ: consome o controller de cupons e separa em dois blocos — cupons de troca
 * (nominais, gerados pelas trocas concluídas) e promocionais —, exibindo
 * valor, validade e se já foram usados.
 *
 * ATENDE: RF0037, RF0045
 */

'use client';

import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/hooks/useAuth';
import { cuponsService } from '@/service/cupons/service';
import { Cupom } from '@/types/cupons/types';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate, hojeISO } from '@/utils/formatDate';

import * as S from './styles';

const situacaoDoCupom = (cupom: Cupom): 'ok' | 'usado' | 'vencido' => {
  if (cupom.utilizado) return 'usado';
  if (cupom.validade < hojeISO()) return 'vencido';

  return 'ok';
};

const rotuloSituacao = {
  ok: 'Disponível',
  usado: 'Já utilizado',
  vencido: 'Vencido',
};

const ListaCupons = ({ cupons }: { cupons: Cupom[] }) => (
  <S.Grade $minimo="16rem">
    {cupons.map(cupom => {
      const situacao = situacaoDoCupom(cupom);

      return (
        <S.Cupom key={cupom.id} $indisponivel={situacao !== 'ok'}>
          <strong>{formatCurrency(cupom.valor)}</strong>
          <code>{cupom.codigo}</code>
          <small>Válido até {formatDate(cupom.validade)}</small>
          <S.Situacao $tipo={situacao}>{rotuloSituacao[situacao]}</S.Situacao>
        </S.Cupom>
      );
    })}
  </S.Grade>
);

const PerfilCupons = () => {
  const { user } = useAuth();
  const clienteId = user?.clienteId;

  const { data: cupons = [], isLoading } = useQuery({
    queryKey: ['cupons', clienteId, 'todos'],
    queryFn: () => cuponsService.fetchCuponsPorCliente(),
    enabled: !!clienteId,
  });

  // RF0045: cupons de troca são nominais; promocionais valem para todos.
  const cuponsTroca = cupons.filter(cupom => cupom.tipo === 'TROCA');
  const cuponsPromocionais = cupons.filter(
    cupom => cupom.tipo === 'PROMOCIONAL',
  );

  if (isLoading) {
    return (
      <S.Container>
        <S.Vazio>
          <strong>Carregando cupons...</strong>
        </S.Vazio>
      </S.Container>
    );
  }

  return (
    <S.Container>
      <S.Cabecalho>
        <S.Titulo>
          <h1>Meus cupons</h1>
          <p>Use no checkout para abater o valor da compra</p>
        </S.Titulo>
      </S.Cabecalho>

      <S.Secao>
        <S.TituloSecao>Cupons de troca</S.TituloSecao>

        {cuponsTroca.length === 0 ? (
          <S.Vazio>
            <strong>Nenhum cupom de troca</strong>
            <p>
              Cupons de troca são gerados quando uma solicitação de troca é
              concluída pelo administrador.
            </p>
          </S.Vazio>
        ) : (
          <ListaCupons cupons={cuponsTroca} />
        )}
      </S.Secao>

      <S.Secao>
        <S.TituloSecao>Cupons promocionais</S.TituloSecao>

        {cuponsPromocionais.length === 0 ? (
          <S.Vazio>
            <strong>Nenhum cupom promocional ativo</strong>
          </S.Vazio>
        ) : (
          <ListaCupons cupons={cuponsPromocionais} />
        )}

        {/* RN0033: só um promocional por compra. */}
        <S.Alerta $tipo="info">
          Apenas um cupom promocional pode ser usado por compra; cupons de troca
          podem ser combinados entre si.
        </S.Alerta>
      </S.Secao>
    </S.Container>
  );
};

export default PerfilCupons;
