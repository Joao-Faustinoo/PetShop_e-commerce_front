/**
 * [MODEL] Service de clientes
 *
 * O QUE FAZ: expõe o acesso aos dados cadastrais de cliente e às suas
 * transações.
 *
 * COMO FARÁ: `fetchClientes(filtros)` filtra `mockClientes` por qualquer
 * campo identificador, isolado ou combinado (RF0024).
 * `fetchClientePorId(id)` monta o detalhe agregando endereços, cartões e
 * pets dos respectivos mocks. `fetchTransacoesCliente(id)` devolve os
 * pedidos daquele cliente (RF0025). `criarCliente` gera o código único da
 * RNF0035 e o ranking inicial da RN0027; `alterarCliente` e
 * `inativarCliente` completam o CRUD.
 *
 * ATENDE: RF0021-RF0025, RNF0035
 */

import { mockCartoes } from '@/mock/cartoes/mock';
import {
  mockClientes,
  proximoCodigoCliente,
  proximoIdCliente,
} from '@/mock/clientes/mock';
import { mockEnderecos, proximoIdEndereco } from '@/mock/enderecos/mock';
import { mockPedidos } from '@/mock/pedidos/mock';
import { mockPets } from '@/mock/pets/mock';
import { delay, delayErro } from '@/service/api/delay';
import {
  AlterarClientePayload,
  Cliente,
  ClienteBase,
  ClienteFiltros,
  CriarClientePayload,
  InativarClientePayload,
} from '@/types/clientes/types';
import { Pedido } from '@/types/pedidos/types';

/**
 * RN0027: o ranking sai do perfil de compras — quanto mais o cliente
 * gastou em compras efetivadas, maior a nota, de 1 a 5.
 */
export const calcularRanking = (clienteId: number): number => {
  const efetivadas = mockPedidos.filter(
    p => p.clienteId === clienteId && p.status !== 'REPROVADA',
  );
  const totalGasto = efetivadas.reduce((soma, p) => soma + p.total, 0);

  if (totalGasto >= 1500) return 5;
  if (totalGasto >= 800) return 4;
  if (totalGasto >= 400) return 3;
  if (totalGasto > 0) return 2;

  return 1;
};

/** Agrega ao registro-base as coleções que vivem nos seus próprios mocks. */
const compor = (base: ClienteBase): Cliente => ({
  ...base,
  enderecos: mockEnderecos.filter(e => e.clienteId === base.id),
  cartoes: mockCartoes.filter(c => c.clienteId === base.id),
  pets: mockPets.filter(p => p.clienteId === base.id),
});

const apenasDigitos = (valor: string): string => valor.replace(/\D/g, '');

export const clientesService = {
  fetchClientes(filtros: ClienteFiltros = {}): Promise<Cliente[]> {
    // RF0024: os campos preenchidos se combinam com AND entre si.
    const resultado = mockClientes.filter(cliente => {
      if (
        filtros.nome &&
        !cliente.nome.toLowerCase().includes(filtros.nome.trim().toLowerCase())
      ) {
        return false;
      }
      if (
        filtros.codigo &&
        !cliente.codigo
          .toLowerCase()
          .includes(filtros.codigo.trim().toLowerCase())
      ) {
        return false;
      }
      if (
        filtros.cpf &&
        !apenasDigitos(cliente.cpf).includes(apenasDigitos(filtros.cpf))
      ) {
        return false;
      }
      if (
        filtros.email &&
        !cliente.email
          .toLowerCase()
          .includes(filtros.email.trim().toLowerCase())
      ) {
        return false;
      }
      if (filtros.genero && cliente.genero !== filtros.genero) return false;
      if (
        filtros.rankingMinimo !== undefined &&
        cliente.ranking < filtros.rankingMinimo
      ) {
        return false;
      }
      if (filtros.ativo !== undefined && cliente.ativo !== filtros.ativo) {
        return false;
      }

      return true;
    });

    return delay(resultado.map(compor));
  },

  fetchClientePorId(id: number): Promise<Cliente> {
    const cliente = mockClientes.find(c => c.id === id);

    if (!cliente) {
      return delayErro('Cliente não encontrado.');
    }

    return delay(compor(cliente));
  },

  /** RF0025: todas as transações já realizadas pelo cliente. */
  fetchTransacoesCliente(clienteId: number): Promise<Pedido[]> {
    const pedidos = mockPedidos
      .filter(p => p.clienteId === clienteId)
      .sort((a, b) => b.dataCompra.localeCompare(a.dataCompra));

    return delay(pedidos);
  },

  criarCliente(payload: CriarClientePayload): Promise<Cliente> {
    const cpfLimpo = apenasDigitos(payload.cpf);
    const duplicado = mockClientes.some(c => apenasDigitos(c.cpf) === cpfLimpo);

    if (duplicado) {
      return delayErro('Já existe um cliente cadastrado com este CPF.');
    }

    const id = proximoIdCliente();

    const cliente: ClienteBase = {
      id,
      // RNF0035: código único gerado pelo sistema.
      codigo: proximoCodigoCliente(),
      nome: payload.nome,
      genero: payload.genero,
      dataNascimento: payload.dataNascimento,
      cpf: payload.cpf,
      email: payload.email,
      telefone: payload.telefone,
      // RN0027: sem histórico de compras, o cliente entra no menor ranking.
      ranking: 1,
      ativo: true,
    };

    mockClientes.push(cliente);

    // RN0021/RN0022: os dois endereços obrigatórios entram junto com o
    // cadastro, cada um com o seu tipo.
    mockEnderecos.push({
      ...payload.enderecoCobranca,
      id: proximoIdEndereco(),
      clienteId: id,
      tipo: 'COBRANCA',
    });
    mockEnderecos.push({
      ...payload.enderecoEntrega,
      id: proximoIdEndereco(),
      clienteId: id,
      tipo: 'ENTREGA',
    });

    return delay(compor(cliente));
  },

  alterarCliente(payload: AlterarClientePayload): Promise<Cliente> {
    const indice = mockClientes.findIndex(c => c.id === payload.id);

    if (indice < 0) {
      return delayErro('Cliente não encontrado.');
    }

    mockClientes[indice] = { ...mockClientes[indice], ...payload };

    return delay(compor(mockClientes[indice]));
  },

  inativarCliente(payload: InativarClientePayload): Promise<Cliente> {
    const indice = mockClientes.findIndex(c => c.id === payload.id);

    if (indice < 0) {
      return delayErro('Cliente não encontrado.');
    }

    mockClientes[indice] = {
      ...mockClientes[indice],
      ativo: false,
      justificativaInativacao: payload.justificativa,
    };

    return delay(compor(mockClientes[indice]));
  },

  ativarCliente(id: number): Promise<Cliente> {
    const indice = mockClientes.findIndex(c => c.id === id);

    if (indice < 0) {
      return delayErro('Cliente não encontrado.');
    }

    mockClientes[indice] = {
      ...mockClientes[indice],
      ativo: true,
      justificativaInativacao: undefined,
    };

    return delay(compor(mockClientes[indice]));
  },

  /** RN0027: reavalia o ranking após uma compra ser efetivada. */
  atualizarRanking(clienteId: number): Promise<Cliente> {
    const indice = mockClientes.findIndex(c => c.id === clienteId);

    if (indice < 0) {
      return delayErro('Cliente não encontrado.');
    }

    mockClientes[indice] = {
      ...mockClientes[indice],
      ranking: calcularRanking(clienteId),
    };

    return delay(compor(mockClientes[indice]), 100);
  },
};
