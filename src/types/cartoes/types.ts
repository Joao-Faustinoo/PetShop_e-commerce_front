/**
 * [MODEL] Tipos de cartão de crédito
 *
 * O QUE FAZ: descreve os cartões de crédito associados ao cliente.
 *
 * COMO FARÁ: exporta `Cartao` com os campos da RN0024 (número, nome
 * impresso, bandeira e código de segurança) mais `preferencial: boolean`
 * exigido pela RF0027. A bandeira referencia `BandeiraCartao` das tabelas
 * de domínio (RN0025). Exporta também `CriarCartaoPayload` e
 * `AlterarCartaoPayload`.
 *
 * ATENDE: RF0027, RF0036, RN0024, RN0025
 */

export interface Cartao {
  id: number;
  clienteId: number;
  numero: string;
  nomeImpresso: string;
  /** RN0025: só bandeiras registradas na tabela de domínio. */
  bandeiraId: number;
  codigoSeguranca: string;
  /** RF0027: exatamente um cartão do cliente é o preferencial. */
  preferencial: boolean;
}

export interface CriarCartaoPayload extends Omit<Cartao, 'id'> {}

export interface AlterarCartaoPayload extends Cartao {}
