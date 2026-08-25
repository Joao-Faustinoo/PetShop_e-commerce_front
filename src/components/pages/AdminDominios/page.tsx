/**
 * [VIEW] Tela: Tabelas de domínio
 *
 * O QUE FAZ: consulta das listas de domínio carregadas no sistema.
 *
 * COMO FARÁ: consome o useDominiosController e exibe, em abas, grupos de precificação,
 * marcas, categorias, espécies, portes, cores, materiais, fornecedores,
 * bandeiras e motivos de ativação/inativação. Torna visível o conteúdo que
 * a RNF0013 exige que exista já na implantação.
 *
 * ATENDE: RNF0013
 */

'use client';

import { useState } from 'react';

import { useDominiosController } from '@/controllers/dominios/useDominiosController';

import * as S from './styles';

/** Cada aba vira uma tabela com as colunas próprias daquele domínio. */
interface Coluna {
  titulo: string;
  numerica?: boolean;
  valor: (registro: Record<string, unknown>) => string | number;
}

const AdminDominios = () => {
  const {
    gruposPrecificacao,
    marcas,
    categorias,
    especies,
    portes,
    cores,
    materiais,
    fornecedores,
    bandeiras,
    tiposResidencia,
    tiposLogradouro,
    tiposTelefone,
    motivosInativacao,
    motivosAtivacao,
  } = useDominiosController();

  const colunasSimples: Coluna[] = [
    { titulo: 'Código', numerica: true, valor: r => Number(r.id) },
    { titulo: 'Nome', valor: r => String(r.nome) },
  ];

  const abas: {
    chave: string;
    titulo: string;
    registros: Record<string, unknown>[];
    colunas: Coluna[];
  }[] = [
    {
      chave: 'grupos',
      titulo: 'Grupos de precificação',
      registros: gruposPrecificacao as unknown as Record<string, unknown>[],
      colunas: [
        ...colunasSimples,
        {
          titulo: 'Margem de lucro',
          numerica: true,
          valor: r => `${Number(r.margemLucro)}%`,
        },
      ],
    },
    {
      chave: 'marcas',
      titulo: 'Marcas',
      registros: marcas as unknown as Record<string, unknown>[],
      colunas: colunasSimples,
    },
    {
      chave: 'categorias',
      titulo: 'Categorias',
      registros: categorias as unknown as Record<string, unknown>[],
      colunas: colunasSimples,
    },
    {
      chave: 'especies',
      titulo: 'Espécies',
      registros: especies.map(e => ({ id: e.value, nome: e.label })),
      colunas: [
        { titulo: 'Código', valor: r => String(r.id) },
        { titulo: 'Nome', valor: r => String(r.nome) },
      ],
    },
    {
      chave: 'portes',
      titulo: 'Portes',
      registros: portes as unknown as Record<string, unknown>[],
      colunas: [
        ...colunasSimples,
        { titulo: 'Sigla', valor: r => String(r.sigla) },
        {
          titulo: 'Faixa de peso',
          valor: r => `${Number(r.pesoMinimo)} a ${Number(r.pesoMaximo)} kg`,
        },
      ],
    },
    {
      chave: 'cores',
      titulo: 'Cores',
      registros: cores as unknown as Record<string, unknown>[],
      colunas: colunasSimples,
    },
    {
      chave: 'materiais',
      titulo: 'Materiais',
      registros: materiais as unknown as Record<string, unknown>[],
      colunas: colunasSimples,
    },
    {
      chave: 'fornecedores',
      titulo: 'Fornecedores',
      registros: fornecedores as unknown as Record<string, unknown>[],
      colunas: [
        ...colunasSimples,
        { titulo: 'CNPJ', valor: r => String(r.cnpj) },
      ],
    },
    {
      chave: 'bandeiras',
      titulo: 'Bandeiras de cartão',
      registros: bandeiras as unknown as Record<string, unknown>[],
      colunas: colunasSimples,
    },
    {
      chave: 'residencias',
      titulo: 'Tipos de residência',
      registros: tiposResidencia as unknown as Record<string, unknown>[],
      colunas: colunasSimples,
    },
    {
      chave: 'logradouros',
      titulo: 'Tipos de logradouro',
      registros: tiposLogradouro as unknown as Record<string, unknown>[],
      colunas: colunasSimples,
    },
    {
      chave: 'telefones',
      titulo: 'Tipos de telefone',
      registros: tiposTelefone as unknown as Record<string, unknown>[],
      colunas: colunasSimples,
    },
    {
      chave: 'motivosInativacao',
      titulo: 'Motivos de inativação',
      registros: motivosInativacao as unknown as Record<string, unknown>[],
      colunas: colunasSimples,
    },
    {
      chave: 'motivosAtivacao',
      titulo: 'Motivos de ativação',
      registros: motivosAtivacao as unknown as Record<string, unknown>[],
      colunas: colunasSimples,
    },
  ];

  const [abaAtiva, setAbaAtiva] = useState(abas[0].chave);
  const aba = abas.find(item => item.chave === abaAtiva) ?? abas[0];

  return (
    <S.Container>
      <S.Cabecalho>
        <S.Titulo>
          <h1>Tabelas de domínio</h1>
          <p>
            Listas carregadas na implantação do sistema e usadas nos selects de
            cadastro
          </p>
        </S.Titulo>
      </S.Cabecalho>

      <S.Abas>
        {abas.map(item => (
          <S.Aba
            key={item.chave}
            type="button"
            $ativa={item.chave === abaAtiva}
            onClick={() => setAbaAtiva(item.chave)}
          >
            {item.titulo}
            <S.Contador>{item.registros.length}</S.Contador>
          </S.Aba>
        ))}
      </S.Abas>

      <S.TabelaWrapper>
        <S.Tabela>
          <thead>
            <tr>
              {aba.colunas.map(coluna => (
                <th
                  key={coluna.titulo}
                  className={coluna.numerica ? 'numero' : undefined}
                >
                  {coluna.titulo}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {aba.registros.map((registro, indice) => (
              // eslint-disable-next-line react/no-array-index-key
              <tr key={`${aba.chave}-${indice}`}>
                {aba.colunas.map(coluna => (
                  <td
                    key={coluna.titulo}
                    className={coluna.numerica ? 'numero' : undefined}
                  >
                    {coluna.valor(registro)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </S.Tabela>
      </S.TabelaWrapper>
    </S.Container>
  );
};

export default AdminDominios;
