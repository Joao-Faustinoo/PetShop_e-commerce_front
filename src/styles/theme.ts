/**
 * [VIEW] Tema
 *
 * O QUE FAZ: define a paleta e os tokens visuais consumidos por todos os
 * styled-components através do ThemeProvider.
 *
 * COMO FARÁ: exporta `theme` com `as const` para o @types/styled.d.ts
 * inferir os tipos. Além das cores de marca e de apoio, expõe
 * `status`, que dá uma cor a cada estado do pedido para o StatusBadge, e
 * `chart`, a sequência de cores distintas que o gráfico gerencial usa nas
 * linhas de categoria, atendendo à exigência de cor distinta por série.
 *
 * ATENDE: RNF0043, RNF0045
 */

export const theme = {
  colors: {
    primary: '#F2994A',
    primaryDark: '#D97B2B',
    secondary: '#2D9CDB',
    default: '#9EABBE',
    graydf: '#DFDFDF',
    gray4c: '#4C4C4C',
    grayb7: '#B7BBBF',
    grayf6: '#F6F6F7',
    grayf5: '#F5F5F8',
    gray88: '#888787',
    black: '#000000',
    white: '#FFFFFF',
    error: '#E52207',
    success: '#0AA937',
    warning: '#E5A50A',
  },
  status: {
    EM_PROCESSAMENTO: '#E5A50A',
    APROVADA: '#0AA937',
    REPROVADA: '#E52207',
    EM_TRANSPORTE: '#2D9CDB',
    ENTREGUE: '#126445',
    EM_TROCA: '#9B51E0',
    TROCA_AUTORIZADA: '#6C3FA6',
    TROCADO: '#4C4C4C',
  },
  chart: [
    '#F2994A',
    '#2D9CDB',
    '#0AA937',
    '#9B51E0',
    '#E52207',
    '#126445',
    '#E5A50A',
    '#4C4C4C',
  ],
} as const;
