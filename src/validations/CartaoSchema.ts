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
    /*
     * RN0025: a bandeira precisa estar entre as registradas. Aqui só se
     * exige que alguma tenha sido escolhida — a lista vem do servidor, e o
     * yup valida de forma síncrona, sem poder esperar por ela. Quem recusa
     * bandeira inexistente é a API, que é de onde a lista sai: repetir a
     * lista aqui criaria uma segunda verdade para divergir da primeira.
     */
    .typeError('Bandeira é obrigatória')
    .required('Bandeira é obrigatória')
    .positive('Selecione uma bandeira'),
  codigoSeguranca: yup
    .string()
    .required('Código de segurança é obrigatório')
    .matches(/^\d{3,4}$/, 'O código de segurança tem 3 ou 4 dígitos'),
  preferencial: yup.boolean().default(false),
});

export type ICartaoForm = yup.InferType<typeof CartaoSchema>;
