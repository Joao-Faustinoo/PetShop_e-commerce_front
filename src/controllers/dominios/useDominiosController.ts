/**
 * [CONTROLLER] useDominiosController
 *
 * O QUE FAZ: entrega à View, já prontas para os selects, todas as listas
 * de domínio do sistema.
 *
 * COMO FARÁ: um `useQuery` por tabela (queryKey ['dominios', <tabela>])
 * chamando o service correspondente, todos com `staleTime` alto e
 * `gcTime` longo, já que são dados praticamente imutáveis. Converte cada
 * lista para o formato `Opcao` (value/label) que o react-select espera,
 * evitando que cada formulário repita esse mapeamento.
 *
 * ATENDE: RNF0013, RN0023, RN0025
 */

'use client';

import { useQuery } from '@tanstack/react-query';

import { dominiosService } from '@/service/dominios/service';
import { Opcao } from '@/types/common/types';
import { Dominio } from '@/types/dominios/types';

// Domínios praticamente não mudam: valem por toda a sessão.
const CACHE = { staleTime: Infinity, gcTime: Infinity };

const paraOpcoes = (itens: Dominio[]): Opcao[] =>
  itens.map(item => ({ value: item.id, label: item.nome }));

export const useDominiosController = () => {
  const gruposPrecificacao = useQuery({
    queryKey: ['dominios', 'gruposPrecificacao'],
    queryFn: dominiosService.fetchGruposPrecificacao,
    ...CACHE,
  });

  const marcas = useQuery({
    queryKey: ['dominios', 'marcas'],
    queryFn: dominiosService.fetchMarcas,
    ...CACHE,
  });

  const categorias = useQuery({
    queryKey: ['dominios', 'categorias'],
    queryFn: dominiosService.fetchCategorias,
    ...CACHE,
  });

  const especies = useQuery({
    queryKey: ['dominios', 'especies'],
    queryFn: dominiosService.fetchEspecies,
    ...CACHE,
  });

  const portes = useQuery({
    queryKey: ['dominios', 'portes'],
    queryFn: dominiosService.fetchPortes,
    ...CACHE,
  });

  const cores = useQuery({
    queryKey: ['dominios', 'cores'],
    queryFn: dominiosService.fetchCores,
    ...CACHE,
  });

  const materiais = useQuery({
    queryKey: ['dominios', 'materiais'],
    queryFn: dominiosService.fetchMateriais,
    ...CACHE,
  });

  const fornecedores = useQuery({
    queryKey: ['dominios', 'fornecedores'],
    queryFn: dominiosService.fetchFornecedores,
    ...CACHE,
  });

  const bandeiras = useQuery({
    queryKey: ['dominios', 'bandeiras'],
    queryFn: dominiosService.fetchBandeiras,
    ...CACHE,
  });

  const tiposResidencia = useQuery({
    queryKey: ['dominios', 'tiposResidencia'],
    queryFn: dominiosService.fetchTiposResidencia,
    ...CACHE,
  });

  const tiposLogradouro = useQuery({
    queryKey: ['dominios', 'tiposLogradouro'],
    queryFn: dominiosService.fetchTiposLogradouro,
    ...CACHE,
  });

  const tiposTelefone = useQuery({
    queryKey: ['dominios', 'tiposTelefone'],
    queryFn: dominiosService.fetchTiposTelefone,
    ...CACHE,
  });

  const motivosInativacao = useQuery({
    queryKey: ['dominios', 'motivosInativacao'],
    queryFn: dominiosService.fetchMotivosInativacao,
    ...CACHE,
  });

  const motivosAtivacao = useQuery({
    queryKey: ['dominios', 'motivosAtivacao'],
    queryFn: dominiosService.fetchMotivosAtivacao,
    ...CACHE,
  });

  return {
    // Listas cruas, para quando a View precisa de outros campos.
    gruposPrecificacao: gruposPrecificacao.data ?? [],
    marcas: marcas.data ?? [],
    categorias: categorias.data ?? [],
    especies: especies.data ?? [],
    portes: portes.data ?? [],
    cores: cores.data ?? [],
    materiais: materiais.data ?? [],
    fornecedores: fornecedores.data ?? [],
    bandeiras: bandeiras.data ?? [],
    tiposResidencia: tiposResidencia.data ?? [],
    tiposLogradouro: tiposLogradouro.data ?? [],
    tiposTelefone: tiposTelefone.data ?? [],
    motivosInativacao: motivosInativacao.data ?? [],
    motivosAtivacao: motivosAtivacao.data ?? [],

    // Prontas para os selects.
    opcoes: {
      gruposPrecificacao: paraOpcoes(gruposPrecificacao.data ?? []),
      marcas: paraOpcoes(marcas.data ?? []),
      categorias: paraOpcoes(categorias.data ?? []),
      especies: (especies.data ?? []).map(e => ({
        value: e.value,
        label: e.label,
      })),
      portes: (portes.data ?? []).map(p => ({
        value: p.sigla,
        label: p.nome,
      })),
      cores: paraOpcoes(cores.data ?? []),
      materiais: paraOpcoes(materiais.data ?? []),
      fornecedores: paraOpcoes(fornecedores.data ?? []),
      bandeiras: paraOpcoes(bandeiras.data ?? []),
      tiposResidencia: paraOpcoes(tiposResidencia.data ?? []),
      tiposLogradouro: paraOpcoes(tiposLogradouro.data ?? []),
      tiposTelefone: paraOpcoes(tiposTelefone.data ?? []),
      motivosInativacao: paraOpcoes(motivosInativacao.data ?? []),
      motivosAtivacao: paraOpcoes(motivosAtivacao.data ?? []),
    },
  };
};

/** Tradutor de id para nome, usado nas listagens e nos detalhes. */
export const nomeDoDominio = (itens: Dominio[], id?: number): string =>
  itens.find(item => item.id === id)?.nome ?? '-';
