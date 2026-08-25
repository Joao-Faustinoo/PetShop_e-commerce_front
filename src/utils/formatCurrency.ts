/**
 * [VIEW] Formatação monetária
 *
 * O QUE FAZ: converte números em texto no formato monetário brasileiro,
 * usado em todo preço exibido e no eixo de valores do gráfico gerencial.
 *
 * COMO FARÁ: exporta `formatCurrency(valor)` sobre Intl.NumberFormat com
 * locale pt-BR e currency BRL (ex.: R$ 20.000,00) e
 * `formatCurrencyCompact(valor)` para o eixo Y do gráfico, que abrevia
 * conforme a escala do maior valor do período.
 *
 * ATENDE: RNF0044
 */

const formatador = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** RNF0044: formato monetário brasileiro (ex.: R$ 20.000,00). */
export const formatCurrency = (valor: number): string =>
  formatador.format(Number.isFinite(valor) ? valor : 0);

/**
 * RNF0044: escala automática do eixo Y conforme o maior valor do período
 * — milhares viram "20 mil" e milhões viram "1,2 mi", mantendo o eixo
 * legível sem estourar a largura.
 */
export const formatCurrencyCompact = (valor: number): string => {
  const absoluto = Math.abs(valor);

  if (absoluto >= 1_000_000) {
    return `R$ ${(valor / 1_000_000).toLocaleString('pt-BR', {
      maximumFractionDigits: 1,
    })} mi`;
  }

  if (absoluto >= 1_000) {
    return `R$ ${(valor / 1_000).toLocaleString('pt-BR', {
      maximumFractionDigits: 1,
    })} mil`;
  }

  return formatCurrency(valor);
};
