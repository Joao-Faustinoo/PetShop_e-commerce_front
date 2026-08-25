/**
 * [VIEW] Rota: /meus-pedidos - historico de compras (RF0025)
 *
 * O QUE FAZ: expõe a rota no App Router. Não tem lógica nem estilo.
 *
 * COMO FARÁ: monta o componente de tela correspondente, que é quem
 * conversa com o controller. Mantém a rota fina para que a tela possa
 * ser reaproveitada e testada fora do roteamento.
 */

import MeusPedidos from '@/components/pages/MeusPedidos/page';

const Page = () => <MeusPedidos />;

export default Page;
