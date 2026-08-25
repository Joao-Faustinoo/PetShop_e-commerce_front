/**
 * [VIEW] Rota: /cadastro - autocadastro do cliente (RF0021)
 *
 * O QUE FAZ: expõe a rota no App Router. Não tem lógica nem estilo.
 *
 * COMO FARÁ: monta o componente de tela correspondente, que é quem
 * conversa com o controller. Mantém a rota fina para que a tela possa
 * ser reaproveitada e testada fora do roteamento.
 */

import CadastroCliente from '@/components/pages/CadastroCliente/page';

const Page = () => <CadastroCliente />;

export default Page;
