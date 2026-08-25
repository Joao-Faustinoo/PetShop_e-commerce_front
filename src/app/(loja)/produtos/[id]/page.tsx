/**
 * [VIEW] Rota: /produtos/[id] - detalhe do produto (RF0015, RF0031)
 *
 * O QUE FAZ: expõe a rota no App Router. Não tem lógica nem estilo.
 *
 * COMO FARÁ: monta o componente de tela correspondente, que é quem
 * conversa com o controller. Mantém a rota fina para que a tela possa
 * ser reaproveitada e testada fora do roteamento.
 */

import DetalheProduto from '@/components/pages/DetalheProduto/page';

const Page = () => <DetalheProduto />;

export default Page;
