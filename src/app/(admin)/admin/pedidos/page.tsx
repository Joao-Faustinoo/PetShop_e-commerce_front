/**
 * [VIEW] Rota: /admin/pedidos - despacho e entrega (RF0039, RF0040)
 *
 * O QUE FAZ: expõe a rota no App Router. Não tem lógica nem estilo.
 *
 * COMO FARÁ: monta o componente de tela correspondente, que é quem
 * conversa com o controller. Mantém a rota fina para que a tela possa
 * ser reaproveitada e testada fora do roteamento.
 */

import AdminPedidos from '@/components/pages/AdminPedidos/page';

const Page = () => <AdminPedidos />;

export default Page;
