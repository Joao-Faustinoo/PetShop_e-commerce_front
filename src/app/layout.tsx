/**
 * [VIEW] Layout raiz
 *
 * O QUE FAZ: envolve toda a aplicação com a fonte, os providers globais e
 * os metadados do site.
 *
 * COMO FARÁ: carrega a fonte Inter, define o metadata do e-commerce e
 * monta o Providers, que já traz o registry do styled-components, o tema,
 * o QueryClientProvider do React Query, o GlobalStyle, o AuthProvider e o
 * ToastContainer.
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import Providers from '@/components/Providers/Providers';

const inter = Inter({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Petshop | Roupas e acessórios para pets',
  description:
    'E-commerce de roupas e acessórios para pets — LES 2º semestre de 2026',
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
};

export default RootLayout;
