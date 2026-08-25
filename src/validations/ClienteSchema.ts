/**
 * [MODEL] Schema de validação de cliente
 *
 * O QUE FAZ: valida o formulário de cadastro e alteração de cliente.
 *
 * COMO FARÁ: objeto yup exigindo gênero, nome, data de nascimento (com
 * idade mínima coerente), CPF válido pelo utilitário de máscara, telefone
 * com tipo, DDD e número, e e-mail em formato válido — os dados
 * obrigatórios da RN0026. Não valida senha, que saiu do escopo pelas
 * premissas do login mockado. Exporta `IClienteForm`.
 *
 * ATENDE: RF0021, RF0022, RN0026
 */

import * as yup from 'yup';

import { apenasDigitos, validarCPF } from '@/utils/masks';

const IDADE_MINIMA = 16;

const idadeEm = (nascimento: Date): number => {
  const hoje = new Date();
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mes = hoje.getMonth() - nascimento.getMonth();

  if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
    idade -= 1;
  }

  return idade;
};

export const ClienteSchema = yup.object({
  nome: yup
    .string()
    .required('Nome é obrigatório')
    .min(3, 'Informe o nome completo')
    .test(
      'nome-completo',
      'Informe nome e sobrenome',
      valor => (valor ?? '').trim().split(/\s+/).length >= 2,
    ),
  genero: yup
    .string()
    .required('Gênero é obrigatório')
    .oneOf(['MASCULINO', 'FEMININO', 'OUTRO'], 'Selecione um gênero'),
  dataNascimento: yup
    .string()
    .required('Data de nascimento é obrigatória')
    .test('data-valida', 'Informe uma data válida', valor => {
      if (!valor) return false;

      return !Number.isNaN(new Date(valor).getTime());
    })
    .test(
      'idade-minima',
      `É necessário ter ao menos ${IDADE_MINIMA} anos`,
      valor => {
        if (!valor) return false;
        const idade = idadeEm(new Date(valor));

        return idade >= IDADE_MINIMA && idade <= 120;
      },
    ),
  cpf: yup
    .string()
    .required('CPF é obrigatório')
    // RN0026: o CPF precisa passar pelos dígitos verificadores.
    .test('cpf-valido', 'Informe um CPF válido', valor =>
      validarCPF(valor ?? ''),
    ),
  email: yup
    .string()
    .required('E-mail é obrigatório')
    .email('Insira um e-mail válido'),
  // RN0026: o telefone é composto por tipo, DDD e número.
  telefoneTipoId: yup
    .number()
    .typeError('Tipo de telefone é obrigatório')
    .required('Tipo de telefone é obrigatório'),
  telefoneDDD: yup
    .string()
    .required('DDD é obrigatório')
    .matches(/^\d{2}$/, 'O DDD tem 2 dígitos'),
  telefoneNumero: yup
    .string()
    .required('Número de telefone é obrigatório')
    .test('telefone-valido', 'Informe um telefone com 8 ou 9 dígitos', valor =>
      [8, 9].includes(apenasDigitos(valor ?? '').length),
    ),
});

export type IClienteForm = yup.InferType<typeof ClienteSchema>;
