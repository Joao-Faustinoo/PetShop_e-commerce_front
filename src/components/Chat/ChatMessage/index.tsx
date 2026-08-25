/**
 * [VIEW] ChatMessage
 *
 * O QUE FAZ: bolha de uma mensagem da conversa.
 *
 * COMO FARÁ: alinha à esquerda ou à direita conforme o autor, exibe o texto e o
 * horário e, quando a resposta traz sugestões, renderiza abaixo os
 * ProdutoCard recomendados.
 *
 * ATENDE: RNF0047
 */

'use client';

import ProdutoCard from '@/components/Cards/ProdutoCard';
import { Mensagem } from '@/types/chat/types';

import * as S from './styles';

interface ChatMessageProps {
  mensagem: Mensagem;
}

const ChatMessage = ({ mensagem }: ChatMessageProps) => {
  const doCliente = mensagem.autor === 'CLIENTE';

  const horario = new Date(mensagem.dataHora).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <S.Linha $doCliente={doCliente}>
      <S.Bolha $doCliente={doCliente}>{mensagem.texto}</S.Bolha>
      <S.Horario>{horario}</S.Horario>

      {/* RNF0047: as sugestões acompanham a resposta do assistente. */}
      {!!mensagem.produtosSugeridos?.length && (
        <S.Sugestoes>
          {mensagem.produtosSugeridos.map(produto => (
            <ProdutoCard key={produto.id} produto={produto} />
          ))}
        </S.Sugestoes>
      )}
    </S.Linha>
  );
};

export default ChatMessage;
