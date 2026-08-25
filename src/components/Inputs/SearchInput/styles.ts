import styled from 'styled-components';

export const Container = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
`;

export const Icon = styled.span`
  position: absolute;
  left: 0.9rem;
  display: flex;
  color: ${({ theme }) => theme.colors.grayb7};
`;

export const Input = styled.input`
  width: 100%;
  min-height: 2.75rem;
  padding: 0 2.5rem;
  border: 1px solid ${({ theme }) => theme.colors.graydf};
  border-radius: 8px;
  font-size: 0.95rem;
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.gray4c};

  &::placeholder {
    color: ${({ theme }) => theme.colors.grayb7};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export const Clear = styled.button`
  position: absolute;
  right: 0.7rem;
  display: flex;
  padding: 0.2rem;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: ${({ theme }) => theme.colors.gray88};

  &:hover {
    background: ${({ theme }) => theme.colors.grayf6};
  }
`;
