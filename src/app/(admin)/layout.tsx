/**
 * [VIEW] Layout do painel administrativo
 *
 * O QUE FAZ: envolve todas as telas do perfil ADMIN com a navegação do
 * painel e barra o acesso de quem não é administrador.
 *
 * COMO FARÁ: monta NavbarAdmin + área de conteúdo. A proteção de rota já
 * roda no AuthProvider, que manda o não autenticado para a raiz e o
 * CLIENTE para /produtos. Os containers styled (AdminContainer e
 * AdminContent) entram quando o styles.ts deste layout for escrito.
 */

'use client';

import { PropsWithChildren } from 'react';

import NavbarAdmin from '@/components/Navbar/NavbarAdmin/NavbarAdmin';

const AdminLayout = ({ children }: PropsWithChildren) => {
  return (
    <>
      <NavbarAdmin />
      <main>{children}</main>
    </>
  );
};

export default AdminLayout;
