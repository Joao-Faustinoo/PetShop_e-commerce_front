/**
 * [VIEW] Rota: /perfil/pets - pets do cliente (RF0028, RF0029)
 *
 * O QUE FAZ: expõe a rota no App Router. Não tem lógica nem estilo.
 *
 * COMO FARÁ: monta o componente de tela correspondente, que é quem
 * conversa com o controller. Mantém a rota fina para que a tela possa
 * ser reaproveitada e testada fora do roteamento.
 */

import PerfilPets from '@/components/pages/PerfilPets/page';

const Page = () => <PerfilPets />;

export default Page;
