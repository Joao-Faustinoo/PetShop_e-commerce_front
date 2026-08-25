/**
 * [VIEW] Rota: /meus-pedidos/[id] - detalhe e solicitacao de troca (RF0041)
 *
 * O QUE FAZ: expõe a rota no App Router. Não tem lógica nem estilo.
 *
 * COMO FARÁ: monta o componente de tela correspondente, que é quem
 * conversa com o controller. Mantém a rota fina para que a tela possa
 * ser reaproveitada e testada fora do roteamento.
 */

import DetalhePedido from '@/components/pages/DetalhePedido/page';

const Page = () => <DetalhePedido />;

export default Page;
