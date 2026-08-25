/**
 * [VIEW] Layout da loja
 *
 * O QUE FAZ: envolve todas as telas do perfil CLIENTE com a navegação da
 * loja e restringe o acesso a quem está logado como cliente.
 *
 * COMO FARÁ: monta NavbarLoja + área de conteúdo. A proteção de rota já
 * roda no AuthProvider, que manda o não autenticado para a raiz e o ADMIN
 * para /admin/pedidos. Os containers styled (LojaContainer e LojaContent)
 * entram quando o styles.ts deste layout for escrito.
 */

'use client';

import { PropsWithChildren } from 'react';

import NavbarLoja from '@/components/Navbar/NavbarLoja/NavbarLoja';

const LojaLayout = ({ children }: PropsWithChildren) => {
  return (
    <>
      <NavbarLoja />
      <main>{children}</main>
    </>
  );
};

export default LojaLayout;
