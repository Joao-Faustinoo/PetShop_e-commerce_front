/**
 * [VIEW] Credenciais de demonstração
 *
 * O QUE FAZ: os atalhos de login que a tela oferece para entrar como
 * cliente ou como administrador sem digitar nada.
 *
 * COMO FARÁ: constantes de interface, não dados de domínio. São os dois
 * cadastros que o seed do banco cria — por isso vivem aqui e não em
 * `mock/`: o mock foi removido, mas o atalho continua sendo parte da
 * demonstração, e a suíte do Cypress clica nestes botões.
 *
 * POR QUE existe: o DRS trata o login como mockado nas premissas, e sem
 * senha real o que resta é facilitar a troca de perfil em apresentação.
 */

export interface CredencialDemo {
  perfil: 'CLIENTE' | 'ADMIN';
  rotulo: string;
  email: string;
  senha: string;
}

export const CREDENCIAIS_DEMO: CredencialDemo[] = [
  {
    perfil: 'CLIENTE',
    rotulo: 'Entrar como cliente',
    email: 'user.cliente@email.com',
    senha: '123@Pass',
  },
  {
    perfil: 'ADMIN',
    rotulo: 'Entrar como administrador',
    email: 'user.admin@email.com',
    senha: '123@Pass',
  },
];
