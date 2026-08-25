/**
 * [VIEW] ChatWidget
 *
 * O QUE FAZ: janela de conversa com o assistente de recomendação.
 *
 * COMO FARÁ: renderiza a lista de ChatMessage com rolagem automática para a última
 * mensagem e o campo de envio. Recebe as mensagens e a ação de enviar por
 * prop, vindas do useChatRecomendacaoController, mantendo-se puro.
 *
 * ATENDE: RNF0047
 */

'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { FiSend } from 'react-icons/fi';

import ChatMessage from '@/components/Chat/ChatMessage';
import { Mensagem } from '@/types/chat/types';

import * as S from './styles';

interface ChatWidgetProps {
  mensagens: Mensagem[];
  onEnviar: (texto: string) => void;
  respondendo: boolean;
}

const atalhos = [
  'Preciso de uma roupa de frio',
  'Quero uma coleira para passeio',
  'Qual tamanho serve no meu pet?',
  'Sugestões de brinquedo',
];

const ChatWidget = ({ mensagens, onEnviar, respondendo }: ChatWidgetProps) => {
  const [texto, setTexto] = useState('');
  const fimDaLista = useRef<HTMLDivElement>(null);

  // Rola para a última mensagem sempre que a conversa cresce.
  useEffect(() => {
    fimDaLista.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens, respondendo]);

  const enviar = (valor: string) => {
    if (!valor.trim() || respondendo) return;

    onEnviar(valor);
    setTexto('');
  };

  const aoSubmeter = (evento: FormEvent) => {
    evento.preventDefault();
    enviar(texto);
  };

  return (
    <S.Janela>
      <S.Mensagens>
        {mensagens.map(mensagem => (
          <ChatMessage key={mensagem.id} mensagem={mensagem} />
        ))}

        {respondendo && (
          <S.Digitando aria-label="O assistente está escrevendo">
            <span />
            <span />
            <span />
          </S.Digitando>
        )}

        <div ref={fimDaLista} />
      </S.Mensagens>

      <S.Sugestoes>
        {atalhos.map(atalho => (
          <S.Atalho
            key={atalho}
            type="button"
            disabled={respondendo}
            onClick={() => enviar(atalho)}
          >
            {atalho}
          </S.Atalho>
        ))}
      </S.Sugestoes>

      <S.Form onSubmit={aoSubmeter}>
        <S.Input
          value={texto}
          placeholder="Pergunte algo sobre roupas e acessórios para o seu pet..."
          aria-label="Mensagem para o assistente"
          onChange={evento => setTexto(evento.target.value)}
        />

        <S.Enviar
          type="submit"
          aria-label="Enviar mensagem"
          disabled={respondendo || !texto.trim()}
        >
          <FiSend size={18} />
        </S.Enviar>
      </S.Form>
    </S.Janela>
  );
};

export default ChatWidget;
