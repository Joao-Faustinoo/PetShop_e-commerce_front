/**
 * [CONTROLLER] useAuth / AuthProvider
 *
 * O QUE FAZ: guarda a sessão mockada, expõe o usuário e o perfil a toda a
 * aplicação e protege as rotas conforme o perfil.
 *
 * COMO FARÁ: no mount, lê usuário e token do localStorage e repovoa o
 * contexto. `isAuthenticated` é o token somado a um usuário com perfil.
 * A proteção compara a rota atual com as públicas (/ e /cadastro) e com o
 * prefixo /admin: quem não está logado volta para a raiz, CLIENTE que
 * tenta /admin vai para /produtos, e ADMIN que cai na loja vai para
 * /admin/pedidos. `logout` limpa o localStorage e volta para a raiz — não
 * há chamada ao servidor, já que a sessão é mockada por premissa.
 */

/* eslint-disable react/jsx-no-constructed-context-values */

'use client';

import {
  createContext,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { Perfil, Usuario } from '@/types/auth/types';
import { localStorageKeys } from '@/utils/localStorageKeys';

export type { Perfil, Usuario };

interface IAuthProvider {
  user: Usuario;
  setUser: React.Dispatch<SetStateAction<Usuario>>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  logout: () => void;
}

const AuthContext = createContext({} as IAuthProvider);

const publicRoutes = ['/', '/cadastro'];

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Usuario>({} as Usuario);
  const [loading, setLoading] = useState(true);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const dataUser = localStorage.getItem(localStorageKeys.user);
    const token = localStorage.getItem(localStorageKeys.accessToken);

    if (dataUser && token) {
      setUser(JSON.parse(dataUser));
    }

    setLoading(false);
  }, []);

  const isAuthenticated = !!user.perfil;
  const isAdmin = user.perfil === 'ADMIN';

  const logout = () => {
    localStorage.removeItem(localStorageKeys.user);
    localStorage.removeItem(localStorageKeys.accessToken);

    setUser({} as Usuario);
    router.push('/');
  };

  useEffect(() => {
    if (loading) return;

    const isPublic = publicRoutes.includes(pathname);
    const isAdminRoute = pathname.startsWith('/admin');

    if (!isAuthenticated && !isPublic) {
      router.push('/');
      return;
    }

    if (isAuthenticated && isAdminRoute && !isAdmin) {
      router.push('/produtos');
      return;
    }

    if (isAuthenticated && !isAdminRoute && !isPublic && isAdmin) {
      router.push('/admin/pedidos');
    }
  }, [loading, isAuthenticated, isAdmin, pathname, router]);

  if (loading) return null;

  return (
    <AuthContext.Provider
      value={{ user, setUser, isAuthenticated, isAdmin, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

export const useAuth = () => useContext(AuthContext);
