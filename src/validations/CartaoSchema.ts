/**
 * [MODEL] Schema de validação de cartão
 *
 * O QUE FAZ: valida o formulário de cartão de crédito.
 *
 * COMO FARÁ: objeto yup exigindo número do cartão, nome impresso,
 * bandeira (que precisa existir nas cadastradas, pela RN0025) e código de
 * segurança, conforme a RN0024. Exporta `ICartaoForm`.
 *
 * ATENDE: RF0027, RF0036, RN0024, RN0025
 */

import * as yup from 'yup';

import { mockBandeiras } from '@/mock/dominios/mock';
import { apenasDigitos } from '@/utils/masks';

export const CartaoSchema = yup.object({
  numero: yup
    .string()
    .required('Número do cartão é obrigatório')
    .test(
      'numero-valido',
      'Informe os 16 dígitos do cartão',
      valor => apenasDigitos(valor ?? '').length === 16,
    ),
  nomeImpresso: yup
    .string()
    .required('Nome impresso no cartão é obrigatório')
    .min(3, 'Informe o nome como está impresso no cartão'),
  // RN0025: só bandeiras registradas nas tabelas de domínio.
  bandeiraId: yup
    .number()
    .typeError('Bandeira é obrigatória')
    .required('Bandeira é obrigatória')
    .oneOf(
      mockBandeiras.map(b => b.id),
      'Selecione uma bandeira registrada no sistema',
    ),
  codigoSeguranca: yup
    .string()
    .required('Código de segurança é obrigatório')
    .matches(/^\d{3,4}$/, 'O código de segurança tem 3 ou 4 dígitos'),
  preferencial: yup.boolean().default(false),
});

export type ICartaoForm = yup.InferType<typeof CartaoSchema>;
