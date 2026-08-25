/**
 * [MODEL] Schema de validação de produto
 *
 * O QUE FAZ: valida o formulário de cadastro e alteração de produto antes
 * de qualquer chamada ao controller.
 *
 * COMO FARÁ: objeto yup exigindo todos os campos obrigatórios da RN0011 —
 * marca, ao menos uma categoria, espécie de destino, porte/tamanho, cor,
 * material, nome, descrição, dimensões (altura, largura, peso e
 * profundidade, todas positivas) e código de barras — mais grupo de
 * precificação e valor de custo maior que zero. Exporta `IProdutoForm`
 * inferido do schema, como já faz o LoginSchema.
 *
 * ATENDE: RF0011, RF0014, RN0011, RN0012
 */

import * as yup from 'yup';

const dimensaoObrigatoria = (rotulo: string) =>
  yup
    .number()
    .typeError(`Informe ${rotulo}`)
    .required(`${rotulo} é obrigatória`)
    .positive(`${rotulo} deve ser maior que zero`);

export const ProdutoSchema = yup.object({
  nome: yup
    .string()
    .required('Nome do produto é obrigatório')
    .min(3, 'Informe ao menos 3 caracteres'),
  descricao: yup
    .string()
    .required('Descrição é obrigatória')
    .min(10, 'Descreva o produto com ao menos 10 caracteres'),
  marcaId: yup
    .number()
    .typeError('Marca é obrigatória')
    .required('Marca é obrigatória'),
  // RN0012: um produto pode pertencer a mais de uma categoria.
  categoriaIds: yup
    .array()
    .of(yup.number().required())
    .min(1, 'Selecione ao menos uma categoria')
    .required('Selecione ao menos uma categoria'),
  especie: yup
    .string()
    .required('Espécie de destino é obrigatória')
    .oneOf(['CAO', 'GATO', 'OUTRO'], 'Selecione cão, gato ou outro'),
  porte: yup
    .string()
    .required('Porte/tamanho é obrigatório')
    .oneOf(['PP', 'P', 'M', 'G', 'GG'], 'Selecione um porte válido'),
  corId: yup
    .number()
    .typeError('Cor é obrigatória')
    .required('Cor é obrigatória'),
  materialId: yup
    .number()
    .typeError('Material é obrigatório')
    .required('Material é obrigatório'),
  // RN0011: as quatro dimensões são dado obrigatório do cadastro.
  altura: dimensaoObrigatoria('a altura'),
  largura: dimensaoObrigatoria('a largura'),
  peso: dimensaoObrigatoria('o peso'),
  profundidade: dimensaoObrigatoria('a profundidade'),
  codigoBarras: yup
    .string()
    .required('Código de barras é obrigatório')
    .matches(/^\d{8,14}$/, 'O código de barras tem entre 8 e 14 dígitos'),
  // RN0013: o grupo é o que define a margem sobre o custo.
  grupoPrecificacaoId: yup
    .number()
    .typeError('Grupo de precificação é obrigatório')
    .required('Grupo de precificação é obrigatório'),
  valorCusto: yup
    .number()
    .typeError('Informe o valor de custo')
    .required('Valor de custo é obrigatório')
    .positive('O valor de custo deve ser maior que zero'),
});

export type IProdutoForm = yup.InferType<typeof ProdutoSchema>;
