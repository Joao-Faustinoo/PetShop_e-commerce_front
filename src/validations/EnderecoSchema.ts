/**
 * [MODEL] Schema de validação de endereço
 *
 * O QUE FAZ: valida o formulário de endereço de entrega e de cobrança.
 *
 * COMO FARÁ: objeto yup exigindo apelido (a frase curta da RF0026), tipo
 * de residência, tipo de logradouro, logradouro, número, bairro, CEP no
 * formato brasileiro, cidade, estado e país — todos obrigatórios pela
 * RN0023 —, deixando observações opcional. Exporta `IEnderecoForm`.
 *
 * ATENDE: RF0026, RF0035, RN0023
 */

import * as yup from 'yup';

export const EnderecoSchema = yup.object({
  // RF0026: cada endereço é identificado por uma frase curta.
  apelido: yup
    .string()
    .required('Dê um nome a este endereço (ex.: Casa, Trabalho)')
    .max(40, 'Use no máximo 40 caracteres'),
  tipo: yup
    .string()
    .required('Tipo do endereço é obrigatório')
    .oneOf(['ENTREGA', 'COBRANCA'], 'Selecione entrega ou cobrança'),
  tipoResidenciaId: yup
    .number()
    .typeError('Tipo de residência é obrigatório')
    .required('Tipo de residência é obrigatório'),
  tipoLogradouroId: yup
    .number()
    .typeError('Tipo de logradouro é obrigatório')
    .required('Tipo de logradouro é obrigatório'),
  logradouro: yup.string().required('Logradouro é obrigatório'),
  numero: yup.string().required('Número é obrigatório'),
  bairro: yup.string().required('Bairro é obrigatório'),
  cep: yup
    .string()
    .required('CEP é obrigatório')
    .matches(/^\d{5}-?\d{3}$/, 'Informe um CEP válido (00000-000)'),
  cidade: yup.string().required('Cidade é obrigatória'),
  estado: yup
    .string()
    .required('Estado é obrigatório')
    .length(2, 'Use a sigla do estado (ex.: SP)'),
  pais: yup.string().required('País é obrigatório'),
  // Único campo opcional da RN0023.
  observacoes: yup.string().max(200, 'Use no máximo 200 caracteres'),
});

export type IEnderecoForm = yup.InferType<typeof EnderecoSchema>;
