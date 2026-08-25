/**
 * [MODEL] Tipos de endereço
 *
 * O QUE FAZ: descreve os endereços de entrega e cobrança associados ao
 * cliente.
 *
 * COMO FARÁ: exporta `Endereco` com todos os campos obrigatórios da RN0023
 * (tipo de residência, tipo de logradouro, logradouro, número, bairro, CEP,
 * cidade, estado, país) mais `observacoes` opcional, `apelido` (a frase
 * curta que identifica o endereço — RF0026) e `tipo` (ENTREGA ou COBRANCA).
 * Exporta também `CriarEnderecoPayload` e `AlterarEnderecoPayload`.
 *
 * ATENDE: RF0026, RF0035, RN0021, RN0022, RN0023, RNF0034
 */

export type TipoEndereco = 'ENTREGA' | 'COBRANCA';

export interface Endereco {
  id: number;
  clienteId: number;
  /** RF0026: frase curta que identifica o endereço (ex.: "Casa"). */
  apelido: string;
  tipo: TipoEndereco;
  tipoResidenciaId: number;
  tipoLogradouroId: number;
  logradouro: string;
  numero: string;
  bairro: string;
  cep: string;
  cidade: string;
  estado: string;
  pais: string;
  /** Único campo não obrigatório da RN0023. */
  observacoes?: string;
}

export interface CriarEnderecoPayload extends Omit<Endereco, 'id'> {}

export interface AlterarEnderecoPayload extends Endereco {}
