/**
 * [VIEW] Rota: /admin/dominios - tabelas de dominio do sistema (RNF0013)
 *
 * O QUE FAZ: expõe a rota no App Router. Não tem lógica nem estilo.
 *
 * COMO FARÁ: monta o componente de tela correspondente, que é quem
 * conversa com o controller. Mantém a rota fina para que a tela possa
 * ser reaproveitada e testada fora do roteamento.
 */

import AdminDominios from '@/components/pages/AdminDominios/page';

const Page = () => <AdminDominios />;

export default Page;
