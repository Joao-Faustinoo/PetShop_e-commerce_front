/**
 * [MODEL] Mock de clientes
 *
 * O QUE FAZ: fornece a base de clientes usada pela consulta do admin e
 * pela tela de perfil do cliente logado.
 *
 * COMO FARÁ: exporta `mockClientes` com cerca de 8 registros contendo
 * todos os campos obrigatórios da RN0026, código único (RNF0035) e
 * ranking variado (RN0027). O cliente de id 1 é o que o usuário mockado
 * assume ao logar e já vem com endereços, cartões e pets vinculados.
 * Inclui ao menos um cliente inativo para exercitar a RF0023.
 *
 * Endereços, cartões e pets ficam nos mocks dos seus próprios domínios e
 * são compostos pelo clientesService na leitura, para que uma inclusão
 * feita na tela de perfil apareça na hora no cadastro do cliente.
 *
 * ATENDE: RF0021-RF0025, RN0026, RN0027
 */

import { ClienteBase } from '@/types/clientes/types';

/** Mutável: o clientesService inclui, altera e inativa neste array. */
export const mockClientes: ClienteBase[] = [
  {
    id: 1,
    codigo: 'CLI-0001',
    nome: 'João Faustino',
    genero: 'FEMININO',
    dataNascimento: '1994-03-12',
    cpf: '111.444.777-35',
    email: 'user.cliente@email.com',
    telefone: { tipoId: 1, ddd: '11', numero: '98877-1234' },
    ranking: 5,
    ativo: true,
  },
  {
    id: 2,
    codigo: 'CLI-0002',
    nome: 'Carlos Henrique Moura',
    genero: 'MASCULINO',
    dataNascimento: '1988-07-25',
    cpf: '123.456.789-09',
    email: 'carlos.moura@email.com',
    telefone: { tipoId: 1, ddd: '21', numero: '99654-8877' },
    ranking: 3,
    ativo: true,
  },
  {
    id: 3,
    codigo: 'CLI-0003',
    nome: 'Mariana Lopes Cardoso',
    genero: 'FEMININO',
    dataNascimento: '1996-11-02',
    cpf: '987.654.321-00',
    email: 'mariana.cardoso@email.com',
    telefone: { tipoId: 1, ddd: '31', numero: '98123-4455' },
    ranking: 4,
    ativo: true,
  },
  {
    id: 4,
    codigo: 'CLI-0004',
    nome: 'Rodrigo Alves Pinto',
    genero: 'MASCULINO',
    dataNascimento: '1979-01-18',
    cpf: '529.982.247-25',
    email: 'rodrigo.pinto@email.com',
    telefone: { tipoId: 2, ddd: '11', numero: '3344-5566' },
    ranking: 2,
    ativo: true,
  },
  {
    id: 5,
    codigo: 'CLI-0005',
    nome: 'Juliana Ferreira Dias',
    genero: 'FEMININO',
    dataNascimento: '2000-05-30',
    cpf: '390.533.447-05',
    email: 'juliana.dias@email.com',
    telefone: { tipoId: 1, ddd: '41', numero: '99001-2233' },
    ranking: 5,
    ativo: true,
  },
  {
    id: 6,
    codigo: 'CLI-0006',
    nome: 'Paulo Sérgio Ramos',
    genero: 'MASCULINO',
    dataNascimento: '1985-09-09',
    cpf: '456.789.123-64',
    email: 'paulo.ramos@email.com',
    telefone: { tipoId: 1, ddd: '51', numero: '98765-1122' },
    ranking: 1,
    ativo: false,
    justificativaInativacao:
      'Cadastro inativado a pedido do titular, por não utilizar mais a loja.',
  },
  {
    id: 7,
    codigo: 'CLI-0007',
    nome: 'Fernanda Souza Lima',
    genero: 'FEMININO',
    dataNascimento: '1992-12-14',
    cpf: '321.654.987-91',
    email: 'fernanda.lima@email.com',
    telefone: { tipoId: 1, ddd: '85', numero: '99887-6543' },
    ranking: 3,
    ativo: true,
  },
  {
    id: 8,
    codigo: 'CLI-0008',
    nome: 'Bruno Tavares Nogueira',
    genero: 'MASCULINO',
    dataNascimento: '1990-02-28',
    cpf: '258.369.147-37',
    email: 'bruno.nogueira@email.com',
    telefone: { tipoId: 3, ddd: '61', numero: '3222-9090' },
    ranking: 2,
    ativo: true,
  },
];

export const proximoIdCliente = (): number =>
  mockClientes.reduce((maior, c) => Math.max(maior, c.id), 0) + 1;

/** RNF0035: código único sequencial no formato CLI-0000. */
export const proximoCodigoCliente = (): string =>
  `CLI-${String(proximoIdCliente()).padStart(4, '0')}`;
