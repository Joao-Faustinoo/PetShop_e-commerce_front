/**
 * [VIEW] NavbarAdmin
 *
 * O QUE FAZ: navegação do painel administrativo.
 *
 * COMO FARÁ: lista os links do admin — produtos, clientes, estoque, pedidos, trocas,
 * análise e domínios — marcando o ativo pelo usePathname. Exibe o nome do
 * administrador logado e o botão de sair.
 *
 * ATENDE: navegação do route group (admin)
 */

'use client';

import { usePathname } from 'next/navigation';
import {
  FiBarChart2,
  FiBox,
  FiDatabase,
  FiLogOut,
  FiRefreshCw,
  FiShoppingBag,
  FiTag,
  FiUsers,
} from 'react-icons/fi';

import ModalConfirmacao from '@/components/Modals/Confirmacao';
import { useConfirmacao } from '@/components/Modals/Confirmacao/useConfirmacao';
import { useAuth } from '@/hooks/useAuth';

import * as S from './styles';

const links = [
  { href: '/admin/pedidos', label: 'Pedidos', icone: FiShoppingBag },
  { href: '/admin/produtos', label: 'Produtos', icone: FiTag },
  { href: '/admin/estoque', label: 'Estoque', icone: FiBox },
  { href: '/admin/trocas', label: 'Trocas', icone: FiRefreshCw },
  { href: '/admin/clientes', label: 'Clientes', icone: FiUsers },
  { href: '/admin/analise', label: 'Análise', icone: FiBarChart2 },
  { href: '/admin/dominios', label: 'Domínios', icone: FiDatabase },
];

const NavbarAdmin = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { propsDoModal, pedirConfirmacao } = useConfirmacao();

  return (
    <>
      <S.Header>
        <S.Container>
          <S.Logo href="/admin/pedidos">
            <S.Marca src="/marca/logo.svg" alt="" aria-hidden />
            PetShop <em>ADMIN</em>
          </S.Logo>

          <S.Links>
            {links.map(({ href, label, icone: Icone }) => (
              <li key={href}>
                <S.NavLink href={href} $ativo={pathname.startsWith(href)}>
                  <Icone size={16} />
                  <span>{label}</span>
                </S.NavLink>
              </li>
            ))}
          </S.Links>

          <S.Usuario>
            <strong>{user?.nome}</strong>
            <S.Sair
              type="button"
              onClick={() =>
                pedirConfirmacao({
                  variante: 'alerta',
                  mensagem:
                    'Você vai sair do painel administrativo e precisará entrar de novo para continuar.',
                  rotuloConfirmar: 'Sair',
                  aoConfirmar: logout,
                })
              }
            >
              <FiLogOut size={16} />
              Sair
            </S.Sair>
          </S.Usuario>
        </S.Container>
      </S.Header>

      <ModalConfirmacao {...propsDoModal} />
    </>
  );
};

export default NavbarAdmin;
