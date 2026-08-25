/**
 * [MODEL] Schema de validação de entrada em estoque
 *
 * O QUE FAZ: valida o formulário de entrada de itens em estoque.
 *
 * COMO FARÁ: objeto yup exigindo produto, quantidade inteira maior que
 * zero (RN0061), valor de custo maior que zero (RN0062), fornecedor e
 * data de entrada obrigatória (RNF0064) — o conjunto definido pela
 * RN0050. Exporta `IEntradaEstoqueForm`.
 *
 * ATENDE: RF0051, RN0050, RN0061, RN0062, RNF0064
 */

import * as yup from 'yup';

export const EntradaEstoqueSchema = yup.object({
  produtoId: yup
    .number()
    .typeError('Produto é obrigatório')
    .required('Produto é obrigatório'),
  // RN0061: não se registra entrada com quantidade igual a zero.
  quantidade: yup
    .number()
    .typeError('Informe a quantidade de itens')
    .required('Quantidade é obrigatória')
    .integer('A quantidade deve ser um número inteiro')
    .min(1, 'A quantidade deve ser maior que zero'),
  // RN0062: todo item precisa ter valor de custo.
  valorCusto: yup
    .number()
    .typeError('Informe o valor de custo')
    .required('Valor de custo é obrigatório')
    .positive('O valor de custo deve ser maior que zero'),
  // RN0050: o fornecedor faz parte dos dados obrigatórios da entrada.
  fornecedorId: yup
    .number()
    .typeError('Fornecedor é obrigatório')
    .required('Fornecedor é obrigatório'),
  // RNF0064: sem data de entrada, o item não pode ser registrado.
  dataEntrada: yup
    .string()
    .required('Data de entrada é obrigatória')
    .test('nao-futura', 'A data de entrada não pode ser futura', valor => {
      if (!valor) return false;

      return valor <= new Date().toISOString().slice(0, 10);
    }),
});

export type IEntradaEstoqueForm = yup.InferType<typeof EntradaEstoqueSchema>;
