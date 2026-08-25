/**
 * [CONTROLLER] useLoginController
 *
 * O QUE FAZ: conduz o login mockado e decide para onde o usuário vai
 * depois de autenticado, conforme o perfil.
 *
 * COMO FARÁ: `useMutation` sobre `authService.login`. No `onSuccess`,
 * grava usuário e token fake no localStorage (via localStorageKeys),
 * popula o contexto do `useAuth` e redireciona: perfil CLIENTE vai para
 * /produtos (route group loja), perfil ADMIN vai para /admin/pedidos
 * (route group admin). No `onError`, dispara o handleToast. Expõe
 * `login`, `isPending` e `erro` para o LoginForm.
 *
 * ATENDE: premissas do projeto (login mockado com dois perfis)
 */

'use client';

import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';

import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/service/auth/service';
import { LoginPayload } from '@/types/auth/types';
import handleError, { handleSuccess } from '@/utils/handleToast';
import { localStorageKeys } from '@/utils/localStorageKeys';

export const useLoginController = () => {
  const router = useRouter();
  const { setUser } = useAuth();

  const {
    mutate: login,
    isPending,
    error,
  } = useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: ({ token, usuario }) => {
      localStorage.setItem(localStorageKeys.accessToken, token);
      localStorage.setItem(localStorageKeys.user, JSON.stringify(usuario));

      setUser(usuario);
      handleSuccess(`Bem-vindo(a), ${usuario.nome.split(' ')[0]}!`);

      // Cada perfil entra pela porta do seu route group.
      router.push(usuario.perfil === 'ADMIN' ? '/admin/pedidos' : '/produtos');
    },
    onError: handleError,
  });

  return { login, isPending, erro: error };
};
