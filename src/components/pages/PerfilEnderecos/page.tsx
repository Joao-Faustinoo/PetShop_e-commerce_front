/**
 * [VIEW] Tela: Meus endereços
 *
 * O QUE FAZ: lista, adiciona, edita e remove os endereços do cliente.
 *
 * COMO FARÁ: consome o useEnderecosController. Cada endereço aparece com seu apelido
 * curto e a marcação de entrega ou cobrança. A edição abre o modal
 * AdicionarEndereco. Impede remover o último endereço de cada tipo.
 *
 * ATENDE: RF0026, RN0021, RN0022, RN0023, RNF0034
 */

'use client';

import { useState } from 'react';
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';

import PrimaryButton from '@/components/Buttons/Primary/button';
import ModalConfirmacao from '@/components/Modals/Confirmacao';
import { useConfirmacao } from '@/components/Modals/Confirmacao/useConfirmacao';
import AdicionarEndereco from '@/components/Modals/AdicionarEndereco';
import {
  nomeDoDominio,
  useDominiosController,
} from '@/controllers/dominios/useDominiosController';
import { useEnderecosController } from '@/controllers/enderecos/useEnderecosController';
import { useAuth } from '@/hooks/useAuth';
import { Endereco, TipoEndereco } from '@/types/enderecos/types';

import * as S from './styles';

const PerfilEnderecos = () => {
  const { user } = useAuth();
  const { tiposLogradouro, tiposResidencia } = useDominiosController();
  const { propsDoModal, pedirConfirmacao } = useConfirmacao();
  const { enderecos, criar, alterar, remover, isPending, isLoading } =
    useEnderecosController(user?.clienteId);

  const [modalAberto, setModalAberto] = useState(false);
  const [enderecoEmEdicao, setEnderecoEmEdicao] = useState<Endereco>();

  const fechar = () => {
    setModalAberto(false);
    setEnderecoEmEdicao(undefined);
  };

  return (
    <S.Container>
      <S.Cabecalho>
        <S.Titulo>
          <h1>Meus endereços</h1>
          <p>Gerencie seus endereços de entrega e de cobrança</p>
        </S.Titulo>

        <PrimaryButton
          label="Novo endereço"
          icon={<FiPlus size={16} />}
          onClick={() => setModalAberto(true)}
        />
      </S.Cabecalho>

      {/* RN0021/RN0022: sempre ao menos um de cada tipo. */}
      <S.Alerta $tipo="info">
        É obrigatório manter ao menos um endereço de cobrança e um de entrega no
        cadastro.
      </S.Alerta>

      {isLoading ? (
        <S.Vazio>
          <strong>Carregando endereços...</strong>
        </S.Vazio>
      ) : (
        <S.Grade $minimo="20rem">
          {enderecos.map(endereco => (
            <S.Cartao key={endereco.id}>
              <S.Topo>
                <strong>{endereco.apelido}</strong>
                <S.Tipo $cobranca={endereco.tipo === 'COBRANCA'}>
                  {endereco.tipo === 'COBRANCA' ? 'Cobrança' : 'Entrega'}
                </S.Tipo>

                <div>
                  <S.BotaoIcone
                    type="button"
                    aria-label={`Editar ${endereco.apelido}`}
                    onClick={() => {
                      setEnderecoEmEdicao(endereco);
                      setModalAberto(true);
                    }}
                  >
                    <FiEdit2 size={16} />
                  </S.BotaoIcone>

                  <S.BotaoIcone
                    type="button"
                    $danger
                    aria-label={`Remover ${endereco.apelido}`}
                    onClick={() =>
                      pedirConfirmacao({
                        variante: 'perigo',
                        titulo: 'Remover endereço',
                        mensagem: `O endereço "${endereco.apelido}" será apagado da sua conta e deixará de aparecer no checkout.`,
                        rotuloConfirmar: 'Remover',
                        aoConfirmar: () => remover(endereco.id),
                      })
                    }
                  >
                    <FiTrash2 size={16} />
                  </S.BotaoIcone>
                </div>
              </S.Topo>

              <S.Linhas>
                {nomeDoDominio(tiposLogradouro, endereco.tipoLogradouroId)}{' '}
                {endereco.logradouro}, {endereco.numero}
                <br />
                {endereco.bairro} · {endereco.cidade}/{endereco.estado}
                <br />
                CEP {endereco.cep} · {endereco.pais}
                <br />
                {nomeDoDominio(tiposResidencia, endereco.tipoResidenciaId)}
              </S.Linhas>

              {endereco.observacoes && (
                <S.Observacao>{endereco.observacoes}</S.Observacao>
              )}
            </S.Cartao>
          ))}
        </S.Grade>
      )}

      <AdicionarEndereco
        aberto={modalAberto}
        endereco={enderecoEmEdicao}
        isPending={isPending}
        onClose={fechar}
        onSubmit={dados => {
          const payload = { ...dados, tipo: dados.tipo as TipoEndereco };

          if (enderecoEmEdicao) {
            alterar(
              {
                ...payload,
                id: enderecoEmEdicao.id,
                clienteId: enderecoEmEdicao.clienteId,
              },
              { onSuccess: fechar },
            );
          } else {
            criar(payload, { onSuccess: fechar });
          }
        }}
      />

      <ModalConfirmacao {...propsDoModal} />
    </S.Container>
  );
};

export default PerfilEnderecos;
