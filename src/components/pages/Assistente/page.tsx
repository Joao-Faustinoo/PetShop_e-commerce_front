/**
 * [VIEW] Tela: Assistente de recomendação
 *
 * O QUE FAZ: chatbot que recomenda produtos e tamanhos adequados ao pet do cliente.
 *
 * COMO FARÁ: monta o ChatWidget e delega ao useChatRecomendacaoController, que envia a
 * pergunta junto do contexto (pets, histórico de compras e preferências).
 * As respostas podem vir com ProdutoCard sugeridos, clicáveis para o
 * detalhe do produto.
 *
 * ATENDE: RNF0047
 */

'use client';

import Link from 'next/link';

import ChatWidget from '@/components/Chat/ChatWidget';
import { useChatRecomendacaoController } from '@/controllers/chat/useChatRecomendacaoController';

import * as S from './styles';

const Assistente = () => {
  const { mensagens, enviarMensagem, respondendo, contexto, temPetCadastrado } =
    useChatRecomendacaoController();

  return (
    <S.Container>
      <S.Cabecalho>
        <S.Titulo>
          <h1>Assistente da loja</h1>
          <p>
            Recomendações de roupas e acessórios personalizadas para o seu pet
          </p>
        </S.Titulo>
      </S.Cabecalho>

      {/* RNF0047: sem pet cadastrado não há como acertar o tamanho. */}
      {!temPetCadastrado && (
        <S.Alerta $tipo="alerta">
          Cadastre um pet em <Link href="/perfil/pets">Meus pets</Link> para o
          assistente sugerir o tamanho adequado das peças.
        </S.Alerta>
      )}

      {temPetCadastrado && contexto && (
        <S.Contexto>
          Sugestões baseadas em{' '}
          <strong>
            {contexto.pets.map(pet => `${pet.nome} (${pet.raca})`).join(', ')}
          </strong>{' '}
          e no seu histórico de compras.
        </S.Contexto>
      )}

      <ChatWidget
        mensagens={mensagens}
        onEnviar={enviarMensagem}
        respondendo={respondendo}
      />
    </S.Container>
  );
};

export default Assistente;
