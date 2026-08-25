import styled from 'styled-components';

export const Container = styled.div`
  display: inline-flex;
  align-items: center;
  border: 1px solid ${({ theme }) => theme.colors.graydf};
  border-radius: 8px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.white};
`;

export const Step = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border: none;
  background: ${({ theme }) => theme.colors.grayf6};
  color: ${({ theme }) => theme.colors.gray4c};

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.graydf};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }
`;

export const Input = styled.input`
  width: 3rem;
  height: 2.25rem;
  border: none;
  text-align: center;
  font-size: 0.95rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.gray4c};

  &:focus {
    outline: none;
  }
`;

export const Limite = styled.small`
  display: block;
  margin-top: 0.35rem;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.gray88};
`;
