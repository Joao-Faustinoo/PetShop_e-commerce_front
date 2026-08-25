/**
 * [VIEW] Formatação de datas
 *
 * O QUE FAZ: padroniza a exibição de datas e a montagem dos rótulos de
 * período do gráfico.
 *
 * COMO FARÁ: sobre date-fns com locale pt-BR, exporta `formatDate` (dd/MM/
 * yyyy), `formatDateTime` (com hora, para o log da RNF0012),
 * `formatPeriodo` (MM/yyyy, o rótulo do eixo X do gráfico) e
 * `diferencaEmMeses`, usada para checar o intervalo de 1 a 24 meses.
 *
 * ATENDE: RNF0012, RNF0043, RN0071, RN0072
 */

import { differenceInMonths, format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/** Aceita tanto Date quanto string ISO, que é o que vem dos mocks. */
const paraData = (valor: string | Date): Date =>
  typeof valor === 'string' ? parseISO(valor) : valor;

export const formatDate = (valor: string | Date): string => {
  if (!valor) return '-';

  return format(paraData(valor), 'dd/MM/yyyy', { locale: ptBR });
};

/** RNF0012: o log precisa registrar data e hora da operação. */
export const formatDateTime = (valor: string | Date): string => {
  if (!valor) return '-';

  return format(paraData(valor), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
};

/** RN0071: rótulo mensal do eixo X do gráfico gerencial. */
export const formatPeriodo = (valor: string | Date): string => {
  if (!valor) return '-';

  return format(paraData(valor), 'MM/yyyy', { locale: ptBR });
};

/** RN0072: base da checagem do intervalo de 1 a 24 meses. */
export const diferencaEmMeses = (
  dataInicio: string | Date,
  dataFim: string | Date,
): number => differenceInMonths(paraData(dataFim), paraData(dataInicio));

/** Data de hoje em ISO curto, formato aceito pelos inputs type="date". */
export const hojeISO = (): string => format(new Date(), 'yyyy-MM-dd');

/** Data de N meses atrás em ISO curto, para pré-preencher filtros. */
export const mesesAtrasISO = (meses: number): string => {
  const data = new Date();
  data.setMonth(data.getMonth() - meses);

  return format(data, 'yyyy-MM-dd');
};
