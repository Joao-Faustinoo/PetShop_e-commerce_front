/**
 * [VIEW] Exportação para planilha
 *
 * O QUE FAZ: gera o arquivo de planilha com os dados exibidos no gráfico
 * gerencial.
 *
 * COMO FARÁ: exporta `exportToSheet(linhas, nomeArquivo)` que recebe as
 * linhas já achatadas em período, categoria e valor de venda, monta a
 * planilha com a biblioteca xlsx e dispara o download no navegador.
 *
 * ATENDE: RF0058
 */

import * as XLSX from 'xlsx';

export const exportToSheet = <T extends object>(
  linhas: T[],
  nomeArquivo: string,
  nomeAba = 'Vendas',
): void => {
  const planilha = XLSX.utils.json_to_sheet(linhas);
  const pasta = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(pasta, planilha, nomeAba);
  // `writeFile` já cria o Blob e dispara o download no navegador.
  XLSX.writeFile(pasta, `${nomeArquivo}.xlsx`);
};
