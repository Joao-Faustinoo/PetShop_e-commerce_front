/**
 * [VIEW] Rota: /carrinho - itens do carrinho (RF0031, RF0032)
 *
 * O QUE FAZ: expõe a rota no App Router. Não tem lógica nem estilo.
 *
 * COMO FARÁ: monta o componente de tela correspondente, que é quem
 * conversa com o controller. Mantém a rota fina para que a tela possa
 * ser reaproveitada e testada fora do roteamento.
 */

import Carrinho from '@/components/pages/Carrinho/page';

const Page = () => <Carrinho />;

export default Page;
