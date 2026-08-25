/**
 * [MODEL] Schema de validação de pet
 *
 * O QUE FAZ: valida o formulário de cadastro e alteração de pet.
 *
 * COMO FARÁ: objeto yup exigindo nome, espécie (restrita a cão, gato ou
 * outro), raça e porte/peso, que é o mínimo definido pela RN0029.
 * Exporta `IPetForm`.
 *
 * ATENDE: RF0028, RF0029, RN0029
 */

import * as yup from 'yup';

export const PetSchema = yup.object({
  nome: yup
    .string()
    .required('Nome do pet é obrigatório')
    .min(2, 'Informe ao menos 2 caracteres'),
  especie: yup
    .string()
    .required('Espécie é obrigatória')
    .oneOf(['CAO', 'GATO', 'OUTRO'], 'Selecione cão, gato ou outro'),
  raca: yup.string().required('Raça é obrigatória'),
  porte: yup
    .string()
    .required('Porte é obrigatório')
    .oneOf(['PP', 'P', 'M', 'G', 'GG'], 'Selecione um porte válido'),
  peso: yup
    .number()
    .typeError('Informe o peso em quilos')
    .required('Peso é obrigatório')
    .positive('O peso deve ser maior que zero')
    .max(120, 'Informe um peso válido'),
});

export type IPetForm = yup.InferType<typeof PetSchema>;
