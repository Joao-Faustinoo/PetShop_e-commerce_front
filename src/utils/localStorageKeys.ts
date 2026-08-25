/**
 * [MODEL] Chaves do localStorage
 *
 * O QUE FAZ: centraliza os nomes das chaves gravadas no navegador, para
 * que nenhum arquivo repita a string solta.
 *
 * COMO FARÁ: exporta `localStorageKeys` com `user` (o Usuario da sessão) e
 * `accessToken` (o token fake do login mockado), ambos prefixados com o
 * namespace do projeto para não colidir com outras aplicações em
 * localhost.
 */

export const localStorageKeys = {
  user: '@petshop: user',
  accessToken: '@petshop: accessToken',
};
