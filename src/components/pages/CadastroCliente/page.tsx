/**
 * [VIEW] Tela: Cadastro de cliente
 *
 * O QUE FAZ: formulário público de autocadastro do cliente.
 *
 * COMO FARÁ: monta o ClienteForm dentro de um card centralizado e delega o submit ao
 * useClienteFormController. Exige ao menos um endereço de cobrança e um de
 * entrega antes de concluir. Ao salvar, leva para a tela de login.
 *
 * ATENDE: RF0021, RN0021, RN0022, RN0026
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiCheckCircle, FiPlus } from 'react-icons/fi';

import SecondaryButton from '@/components/Buttons/Secondary/button';
import ClienteForm from '@/components/Forms/ClienteForm/ClienteForm';
import AdicionarEndereco from '@/components/Modals/AdicionarEndereco';
import { useClienteFormController } from '@/controllers/clientes/useClienteFormController';
import { Genero } from '@/types/clientes/types';
import { Endereco, TipoEndereco } from '@/types/enderecos/types';
import handleError from '@/utils/handleToast';
import { IEnderecoForm } from '@/validations/EnderecoSchema';

import * as S from './styles';

type EnderecoNovo = Omit<Endereco, 'id' | 'clienteId'>;

const paraEndereco = (
  dados: IEnderecoForm,
  tipo: TipoEndereco,
): EnderecoNovo => ({
  ...dados,
  tipo,
  observacoes: dados.observacoes || undefined,
});

const CadastroCliente = () => {
  const { criar, isPending } = useClienteFormController();

  // RN0021/RN0022: o cadastro só conclui com os dois endereços.
  const [enderecoCobranca, setEnderecoCobranca] = useState<EnderecoNovo>();
  const [enderecoEntrega, setEnderecoEntrega] = useState<EnderecoNovo>();
  const [modalAberto, setModalAberto] = useState<TipoEndereco>();

  const resumo = (endereco?: EnderecoNovo) =>
    endereco
      ? `${endereco.apelido} — ${endereco.logradouro}, ${endereco.numero}, ${endereco.cidade}/${endereco.estado}`
      : 'Nenhum endereço informado';

  return (
    <S.Tela>
      <S.Card>
        <S.Topo>
          <h1>🐾 Criar conta</h1>
          <p>Cadastre-se para comprar roupas e acessórios para o seu pet</p>
        </S.Topo>

        <ClienteForm
          isPending={isPending}
          rotuloSubmit="Concluir cadastro"
          onSubmit={dados => {
            // RN0021/RN0022: barra o envio sem os dois endereços.
            if (!enderecoCobranca || !enderecoEntrega) {
              handleError(
                new Error(
                  'Informe um endereço de cobrança e um endereço de entrega para concluir.',
                ),
              );

              return;
            }

            criar({
              nome: dados.nome,
              genero: dados.genero as Genero,
              dataNascimento: dados.dataNascimento,
              cpf: dados.cpf,
              email: dados.email,
              telefone: {
                tipoId: dados.telefoneTipoId,
                ddd: dados.telefoneDDD,
                numero: dados.telefoneNumero,
              },
              enderecoCobranca,
              enderecoEntrega,
            });
          }}
          camposExtras={
            <>
              <S.Endereco>
                <legend>Endereço de cobrança</legend>

                <S.Resumo>
                  {enderecoCobranca && <FiCheckCircle size={16} />}
                  <strong>{resumo(enderecoCobranca)}</strong>

                  <SecondaryButton
                    label={enderecoCobranca ? 'Alterar' : 'Informar endereço'}
                    icon={<FiPlus size={15} />}
                    onClick={() => setModalAberto('COBRANCA')}
                  />
                </S.Resumo>
              </S.Endereco>

              <S.Endereco>
                <legend>Endereço de entrega</legend>

                <S.Resumo>
                  {enderecoEntrega && <FiCheckCircle size={16} />}
                  <strong>{resumo(enderecoEntrega)}</strong>

                  <SecondaryButton
                    label={enderecoEntrega ? 'Alterar' : 'Informar endereço'}
                    icon={<FiPlus size={15} />}
                    onClick={() => setModalAberto('ENTREGA')}
                  />
                </S.Resumo>
              </S.Endereco>
            </>
          }
        />

        <S.Login>
          Já tem conta? <Link href="/">Entrar</Link>
        </S.Login>
      </S.Card>

      <AdicionarEndereco
        aberto={!!modalAberto}
        tipoFixo={modalAberto}
        onClose={() => setModalAberto(undefined)}
        onSubmit={dados => {
          if (modalAberto === 'COBRANCA') {
            setEnderecoCobranca(paraEndereco(dados, 'COBRANCA'));
          } else {
            setEnderecoEntrega(paraEndereco(dados, 'ENTREGA'));
          }

          setModalAberto(undefined);
        }}
      />
    </S.Tela>
  );
};

export default CadastroCliente;
