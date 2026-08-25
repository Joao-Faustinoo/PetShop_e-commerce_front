/**
 * [MODEL] Simulador de latência
 *
 * O QUE FAZ: dá aos services mockados o comportamento assíncrono de uma
 * chamada de rede real, para que os estados de loading e os skeletons da
 * View sejam efetivamente exercitados.
 *
 * COMO FARÁ: exporta `delay<T>(dados, ms = 400): Promise<T>` que resolve
 * após o tempo informado. O padrão fica abaixo de 1 segundo para respeitar
 * o teto de resposta de consulta da RNF0011.
 *
 * ATENDE: RNF0011
 */

export const delay = <T>(dados: T, ms = 400): Promise<T> =>
  new Promise(resolve => {
    setTimeout(() => resolve(dados), ms);
  });

/** Versão para os casos de erro, mantendo a mesma latência simulada. */
export const delayErro = (mensagem: string, ms = 400): Promise<never> =>
  new Promise((_, reject) => {
    setTimeout(() => reject(new Error(mensagem)), ms);
  });
