/**
 * [VIEW] Rota: /produtos - vitrine com filtros (RF0015)
 *
 * O QUE FAZ: expõe a rota no App Router. Não tem lógica nem estilo.
 *
 * COMO FARÁ: monta o componente de tela correspondente, que é quem
 * conversa com o controller. Mantém a rota fina para que a tela possa
 * ser reaproveitada e testada fora do roteamento.
 */

import Catalogo from '@/components/pages/Catalogo/page';

const Page = () => <Catalogo />;

export default Page;
