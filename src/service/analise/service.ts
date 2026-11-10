/**
 * [MODEL] Service da análise gerencial
 *
 * O QUE FAZ: busca a série de vendas por categoria que alimenta o gráfico
 * de linhas.
 *
 * COMO FARÁ: uma chamada à API, que já devolve a série pronta. A
 * agregação por mês, o rateio entre categorias, o preenchimento dos meses
 * sem venda (RN0073) e as cores das linhas ficam no servidor: ele soma no
 * banco, em SQL, sobre dois anos de compras que não precisam trafegar até
 * o navegador só para serem somadas aqui.
 *
 * ATENDE: RF0055, RF0056, RF0057, RN0071-RN0074, RNF0043-RNF0046
 */

import { api } from '@/service/api/request';
import { AnaliseFiltro, AnaliseVendas } from '@/types/analise/types';

/** As categorias viajam como lista separada por vírgula na query. */
const montarQuery = (filtro: AnaliseFiltro): string => {
  const parametros = new URLSearchParams({
    dataInicio: filtro.dataInicio,
    dataFim: filtro.dataFim,
    categoriaIds: filtro.categoriaIds.join(','),
  });

  return parametros.toString();
};

export const analiseService = {
  fetchAnaliseVendas(filtro: AnaliseFiltro): Promise<AnaliseVendas> {
    return api<AnaliseVendas>(`/analise/vendas?${montarQuery(filtro)}`);
  },
};
