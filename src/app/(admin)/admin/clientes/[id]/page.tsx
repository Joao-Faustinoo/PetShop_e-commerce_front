/**
 * [VIEW] Rota: /admin/clientes/[id] - cadastro e transacoes do cliente (RF0022, RF0025)
 *
 * O QUE FAZ: expõe a rota no App Router. Não tem lógica nem estilo.
 *
 * COMO FARÁ: monta o componente de tela correspondente, que é quem
 * conversa com o controller. Mantém a rota fina para que a tela possa
 * ser reaproveitada e testada fora do roteamento.
 */

import AdminClienteDetalhe from '@/components/pages/AdminClienteDetalhe/page';

const Page = () => <AdminClienteDetalhe />;

export default Page;
