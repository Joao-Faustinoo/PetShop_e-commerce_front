import styled from 'styled-components';

export const Container = styled.div`
  width: 100%;
  height: 26rem;
  padding: 1.5rem 1rem 1rem;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.white};
`;

export const Tooltip = styled.div`
  padding: 0.75rem 1rem;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.graydf};
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);

  strong {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.85rem;
    color: ${({ theme }) => theme.colors.gray4c};
  }
`;

export const TooltipLinha = styled.p<{ $cor: string }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.gray88};

  &::before {
    content: '';
    width: 0.6rem;
    height: 0.6rem;
    border-radius: 50%;
    background: ${({ $cor }) => $cor};
  }

  span {
    margin-left: auto;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.gray4c};
  }
`;

export const Vazio = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${({ theme }) => theme.colors.gray88};
`;
