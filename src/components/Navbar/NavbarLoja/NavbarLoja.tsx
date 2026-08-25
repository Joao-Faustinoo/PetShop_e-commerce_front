/**
 * [VIEW] NavbarLoja
 *
 * O QUE FAZ: navegação do perfil cliente.
 *
 * COMO FARÁ: lista os links da loja — catálogo, carrinho (com contador de itens),
 * meus pedidos, assistente e perfil — marcando o ativo pelo usePathname.
 * Exibe o nome do cliente logado vindo do useAuth e o botão de sair.
 *
 * ATENDE: navegação do route group (loja)
 */

'use client';

import { usePathname } from 'next/navigation';
import {
  FiLogOut,
  FiMessageCircle,
  FiPackage,
  FiShoppingBag,
  FiShoppingCart,
  FiUser,
} from 'react-icons/fi';

import { useCarrinhoController } from '@/controllers/carrinho/useCarrinhoController';
import ModalConfirmacao from '@/components/Modals/Confirmacao';
import { useConfirmacao } from '@/components/Modals/Confirmacao/useConfirmacao';
import { useAuth } from '@/hooks/useAuth';

import * as S from './styles';

const links = [
  { href: '/produtos', label: 'Catálogo', icone: FiShoppingBag },
  { href: '/carrinho', label: 'Carrinho', icone: FiShoppingCart },
  { href: '/meus-pedidos', label: 'Meus pedidos', icone: FiPackage },
  { href: '/assistente', label: 'Assistente', icone: FiMessageCircle },
  { href: '/perfil', label: 'Meu perfil', icone: FiUser },
];

const NavbarLoja = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { propsDoModal, pedirConfirmacao } = useConfirmacao();
  const { quantidadeItens } = useCarrinhoController();

  return (
    <>
      <S.Header>
        <S.Container>
          <S.Logo href="/produtos">
            <S.Marca src="/marca/logo.svg" alt="" aria-hidden />
            PetShop
          </S.Logo>

          <S.Links>
            {links.map(({ href, label, icone: Icone }) => (
              <li key={href}>
                <S.NavLink href={href} $ativo={pathname.startsWith(href)}>
                  <Icone size={17} />
                  <span>{label}</span>

                  {/* Contador de itens do carrinho. */}
                  {href === '/carrinho' && quantidadeItens > 0 && (
                    <S.Badge>{quantidadeItens}</S.Badge>
                  )}
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
                    'Você vai sair da sua conta. Itens que estiverem no carrinho continuam reservados até o fim do prazo.',
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

export default NavbarLoja;
