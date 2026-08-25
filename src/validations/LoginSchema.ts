/**
 * [MODEL] Schema de validação de login
 *
 * O QUE FAZ: valida o formulário de entrada no sistema.
 *
 * COMO FARÁ: objeto yup exigindo e-mail em formato válido e senha
 * preenchida. Não há regra de força de senha, confirmação nem
 * recuperação: as premissas do DRS removeram esses requisitos junto com
 * a autenticação real. Exporta `ILoginForm`.
 *
 * ATENDE: premissas do projeto (login mockado)
 */

import * as yup from 'yup';

export const LoginSchema = yup.object({
  email: yup
    .string()
    .required('E-mail é obrigatório')
    .email('Insira um e-mail válido'),
  senha: yup.string().required('Senha é obrigatória'),
});

export type ILoginForm = yup.InferType<typeof LoginSchema>;
