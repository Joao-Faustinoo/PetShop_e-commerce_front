/**
 * [VIEW] Tela: Meu perfil
 *
 * O QUE FAZ: exibe e permite alterar os dados cadastrais do cliente logado.
 *
 * COMO FARÁ: consome o useClienteController para carregar e o useClienteFormController
 * para salvar. Traz apenas os dados pessoais; endereços, cartões e pets
 * ficam em abas próprias, o que atende à separação exigida pela RNF0034.
 *
 * ATENDE: RF0022, RN0026, RNF0034
 */

'use client';

import { FiCreditCard, FiGift, FiMapPin } from 'react-icons/fi';

import ClienteForm from '@/components/Forms/ClienteForm/ClienteForm';
import { useClienteController } from '@/controllers/clientes/useClienteController';
import { useClienteFormController } from '@/controllers/clientes/useClienteFormController';
import { useAuth } from '@/hooks/useAuth';
import { Genero } from '@/types/clientes/types';

import * as S from './styles';

const PetIcone = () => <span aria-hidden>🐾</span>;

const Perfil = () => {
  const { user } = useAuth();
  const { cliente, faixaRanking, isLoading } = useClienteController(
    user?.clienteId,
  );
  const { alterar, isPending } = useClienteFormController(cliente);

  if (isLoading || !cliente) {
    return (
      <S.Container>
        <S.Vazio>
          <strong>Carregando perfil...</strong>
        </S.Vazio>
      </S.Container>
    );
  }

  return (
    <S.Container>
      <S.Cabecalho>
        <S.Titulo>
          <h1>Meu perfil</h1>
          <p>Seus dados cadastrais</p>
        </S.Titulo>
      </S.Cabecalho>

      <S.Identificacao>
        <div>
          <strong>{cliente.nome}</strong>
          <small>
            Código {cliente.codigo} · {cliente.email}
          </small>
        </div>

        {/* RN0027: o ranking traduzido em faixa legível. */}
        <S.Ranking>Cliente {faixaRanking}</S.Ranking>
      </S.Identificacao>

      {/* RNF0034: endereços e cartões se alteram sem abrir este formulário. */}
      <S.Atalhos>
        <S.Atalho href="/perfil/enderecos">
          <FiMapPin size={17} /> Meus endereços
        </S.Atalho>
        <S.Atalho href="/perfil/cartoes">
          <FiCreditCard size={17} /> Meus cartões
        </S.Atalho>
        <S.Atalho href="/perfil/pets">
          <PetIcone /> Meus pets
        </S.Atalho>
        <S.Atalho href="/perfil/cupons">
          <FiGift size={17} /> Meus cupons
        </S.Atalho>
      </S.Atalhos>

      <S.Painel>
        <S.TituloSecao>Dados pessoais</S.TituloSecao>

        <ClienteForm
          cliente={cliente}
          isPending={isPending}
          onSubmit={dados =>
            alterar({
              id: cliente.id,
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
            })
          }
        />
      </S.Painel>
    </S.Container>
  );
};

export default Perfil;
