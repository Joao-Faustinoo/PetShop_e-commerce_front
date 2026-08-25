/**
 * [CONTROLLER] useClienteFormController
 *
 * O QUE FAZ: conduz o cadastro e a alteração de cliente.
 *
 * COMO FARÁ: `useMutation` de criação e de alteração sobre o service,
 * invalidando ['clientes'] no sucesso. Antes de enviar, confere os dados
 * obrigatórios da RN0026 (gênero, nome, data de nascimento, CPF,
 * telefone com tipo/DDD/número e e-mail) e a exigência de ao menos um
 * endereço de cobrança (RN0021) e um de entrega (RN0022) — o cadastro não
 * conclui sem eles. Não trata senha: fora do escopo pelas premissas.
 * Registra a operação no log.
 *
 * ATENDE: RF0021, RF0022, RN0021, RN0022, RN0026, RNF0012
 */

'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useLogTransacaoController } from '@/controllers/log/useLogTransacaoController';
import { clientesService } from '@/service/clientes/service';
import {
  AlterarClientePayload,
  Cliente,
  CriarClientePayload,
} from '@/types/clientes/types';
import handleError, { handleSuccess } from '@/utils/handleToast';

export const useClienteFormController = (clienteAtual?: Cliente) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { registrar } = useLogTransacaoController();

  const invalidar = () =>
    queryClient.invalidateQueries({ queryKey: ['clientes'] });

  const { mutate: criar, isPending: criando } = useMutation({
    mutationFn: (payload: CriarClientePayload) => {
      // RN0021/RN0022: o cadastro não conclui sem os dois endereços.
      if (!payload.enderecoCobranca || !payload.enderecoEntrega) {
        return Promise.reject(
          new Error(
            'É obrigatório informar um endereço de cobrança e um de entrega.',
          ),
        );
      }

      return clientesService.criarCliente(payload);
    },
    onSuccess: cliente => {
      registrar({
        entidade: 'Cliente',
        entidadeId: cliente.id,
        operacao: 'INSERCAO',
      });
      invalidar();
      handleSuccess(
        `Cadastro concluído! Seu código de cliente é ${cliente.codigo}.`,
      );
      router.push('/');
    },
    onError: handleError,
  });

  const { mutate: alterar, isPending: alterando } = useMutation({
    mutationFn: (payload: AlterarClientePayload) =>
      clientesService.alterarCliente(payload),
    onSuccess: cliente => {
      registrar({
        entidade: 'Cliente',
        entidadeId: cliente.id,
        operacao: 'ALTERACAO',
        antes: clienteAtual as unknown as Record<string, unknown>,
        depois: cliente as unknown as Record<string, unknown>,
      });
      invalidar();
      queryClient.invalidateQueries({ queryKey: ['clientes', cliente.id] });
      handleSuccess('Dados cadastrais atualizados.');
    },
    onError: handleError,
  });

  return {
    criar,
    alterar,
    isPending: criando || alterando,
    modoEdicao: !!clienteAtual,
  };
};
