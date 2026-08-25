/**
 * [VIEW] Tela: Análise de vendas
 *
 * O QUE FAZ: painel gerencial com o gráfico de evolução de vendas por categoria.
 *
 * COMO FARÁ: consome o useAnaliseVendasController. O filtro de período e a seleção
 * múltipla de categorias abrem no modal FiltroAnalise, que bloqueia data
 * de fim anterior à de início e intervalo fora de 1 a 24 meses. Renderiza o
 * LineChart com eixo X em mês/ano, eixo Y em reais, legenda inferior e
 * tooltip por ponto. O botão exportar usa o useExportarAnaliseController.
 *
 * ATENDE: RF0055-RF0058, RNF0043-RNF0046, RN0071-RN0074
 */

'use client';

import { useState } from 'react';
import { FiDownload, FiFilter } from 'react-icons/fi';

import PrimaryButton from '@/components/Buttons/Primary/button';
import SecondaryButton from '@/components/Buttons/Secondary/button';
import LineChart from '@/components/Charts/LineChart';
import FiltroAnalise from '@/components/Modals/FiltroAnalise';
import GraficoSkeleton from '@/components/skeletons/GraficoSkeleton';
import { useAnaliseVendasController } from '@/controllers/analise/useAnaliseVendasController';
import { useExportarAnaliseController } from '@/controllers/analise/useExportarAnaliseController';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';

import * as S from './styles';

const AdminAnalise = () => {
  const {
    filtro,
    aplicarFiltro,
    erroFiltro,
    analise,
    series,
    total,
    isLoading,
  } = useAnaliseVendasController();
  const { exportar, podeExportar } = useExportarAnaliseController(analise);

  const [modalAberto, setModalAberto] = useState(false);

  return (
    <S.Container>
      <S.Cabecalho>
        <S.Titulo>
          <h1>Análise de vendas</h1>
          <p>
            Evolução mensal por categoria de {formatDate(filtro.dataInicio)} a{' '}
            {formatDate(filtro.dataFim)}
          </p>
        </S.Titulo>

        <S.Acoes>
          <SecondaryButton
            label="Filtrar"
            icon={<FiFilter size={15} />}
            onClick={() => setModalAberto(true)}
          />

          {/* RF0058: exporta exatamente o recorte exibido. */}
          <PrimaryButton
            label="Exportar planilha"
            icon={<FiDownload size={16} />}
            disabled={!podeExportar}
            onClick={exportar}
          />
        </S.Acoes>
      </S.Cabecalho>

      {erroFiltro ? (
        <S.Alerta $tipo="erro">{erroFiltro}</S.Alerta>
      ) : (
        <>
          <S.Resumo>
            <S.Indicador>
              <small>Total no período</small>
              <strong>{formatCurrency(total)}</strong>
            </S.Indicador>

            <S.Indicador>
              <small>Categorias comparadas</small>
              <strong>{series.length}</strong>
            </S.Indicador>

            {/* RNF0045: legenda identificando a cor de cada categoria. */}
            <S.Legenda>
              {series.map(serie => (
                <S.Serie key={serie.categoriaId} $cor={serie.cor}>
                  {serie.nome}
                </S.Serie>
              ))}
            </S.Legenda>
          </S.Resumo>

          {isLoading || !analise ? (
            <GraficoSkeleton />
          ) : (
            <LineChart dados={analise} />
          )}

          {/* RN0071/RN0073/RN0074: como o gráfico é montado. */}
          <S.Alerta $tipo="info">
            Os valores são agrupados por mês e consideram apenas compras
            aprovadas, em transporte ou entregues. Meses sem venda aparecem como
            R$ 0,00, mantendo a linha contínua.
          </S.Alerta>
        </>
      )}

      <FiltroAnalise
        aberto={modalAberto}
        filtro={filtro}
        onClose={() => setModalAberto(false)}
        onAplicar={aplicarFiltro}
      />
    </S.Container>
  );
};

export default AdminAnalise;
