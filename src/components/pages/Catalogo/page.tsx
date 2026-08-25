/**
 * [VIEW] Tela: Catálogo
 *
 * O QUE FAZ: vitrine de produtos com busca e filtros combinados.
 *
 * COMO FARÁ: mantém o termo de busca em estado local, passa pelo useDebounce e entrega
 * ao useProdutosController, que o usa na queryKey. Renderiza a barra de
 * filtros (espécie, porte, categoria, marca, cor, faixa de preço) e a grade
 * de ProdutoCard, com skeleton enquanto carrega.
 *
 * ATENDE: RF0015, RNF0011
 */

'use client';

import { useMemo, useState } from 'react';

import ProdutoCard from '@/components/Cards/ProdutoCard';
import SearchInput from '@/components/Inputs/SearchInput/input';
import CatalogoSkeleton from '@/components/skeletons/CatalogoSkeleton';
import { useDominiosController } from '@/controllers/dominios/useDominiosController';
import { useProdutosController } from '@/controllers/produtos/useProdutosController';
import { useDebounce } from '@/hooks/useDebounce';
import { Especie, PorteSigla } from '@/types/dominios/types';
import { ProdutoFiltros } from '@/types/produtos/types';

import * as S from './styles';

const Catalogo = () => {
  const { especies, portes, categorias, marcas, cores } =
    useDominiosController();

  // O valor imediato mantém a digitação fluida; o debounced vai à queryKey.
  const [busca, setBusca] = useState('');
  const buscaDebounced = useDebounce(busca);

  const [especie, setEspecie] = useState('');
  const [porte, setPorte] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [marcaId, setMarcaId] = useState('');
  const [corId, setCorId] = useState('');
  const [precoMaximo, setPrecoMaximo] = useState('');

  // RF0015: os campos preenchidos se combinam; os vazios não restringem.
  const filtros = useMemo<ProdutoFiltros>(
    () => ({
      // A vitrine mostra apenas produtos ativos.
      ativo: true,
      nome: buscaDebounced || undefined,
      especie: (especie as Especie) || undefined,
      porte: (porte as PorteSigla) || undefined,
      categoriaId: categoriaId ? Number(categoriaId) : undefined,
      marcaId: marcaId ? Number(marcaId) : undefined,
      corId: corId ? Number(corId) : undefined,
      precoMaximo: precoMaximo ? Number(precoMaximo) : undefined,
    }),
    [buscaDebounced, especie, porte, categoriaId, marcaId, corId, precoMaximo],
  );

  const { produtos, total, isLoading } = useProdutosController(filtros);

  const limparFiltros = () => {
    setBusca('');
    setEspecie('');
    setPorte('');
    setCategoriaId('');
    setMarcaId('');
    setCorId('');
    setPrecoMaximo('');
  };

  return (
    <S.Container>
      <S.Cabecalho>
        <S.Titulo>
          <h1>Catálogo</h1>
          <p>Roupas e acessórios para o seu pet</p>
        </S.Titulo>
      </S.Cabecalho>

      <S.Filtros $colunas={3}>
        <S.CampoFiltro $span={3}>
          <SearchInput
            value={busca}
            onChange={setBusca}
            placeholder="Buscar por nome ou código do produto..."
          />
        </S.CampoFiltro>

        <S.CampoFiltro>
          <label htmlFor="especie">Espécie</label>
          <select
            id="especie"
            value={especie}
            onChange={evento => setEspecie(evento.target.value)}
          >
            <option value="">Todas</option>
            {especies.map(item => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </S.CampoFiltro>

        <S.CampoFiltro>
          <label htmlFor="porte">Porte</label>
          <select
            id="porte"
            value={porte}
            onChange={evento => setPorte(evento.target.value)}
          >
            <option value="">Todos</option>
            {portes.map(item => (
              <option key={item.id} value={item.sigla}>
                {item.nome}
              </option>
            ))}
          </select>
        </S.CampoFiltro>

        <S.CampoFiltro>
          <label htmlFor="categoria">Categoria</label>
          <select
            id="categoria"
            value={categoriaId}
            onChange={evento => setCategoriaId(evento.target.value)}
          >
            <option value="">Todas</option>
            {categorias.map(item => (
              <option key={item.id} value={item.id}>
                {item.nome}
              </option>
            ))}
          </select>
        </S.CampoFiltro>

        <S.CampoFiltro>
          <label htmlFor="marca">Marca</label>
          <select
            id="marca"
            value={marcaId}
            onChange={evento => setMarcaId(evento.target.value)}
          >
            <option value="">Todas</option>
            {marcas.map(item => (
              <option key={item.id} value={item.id}>
                {item.nome}
              </option>
            ))}
          </select>
        </S.CampoFiltro>

        <S.CampoFiltro>
          <label htmlFor="cor">Cor</label>
          <select
            id="cor"
            value={corId}
            onChange={evento => setCorId(evento.target.value)}
          >
            <option value="">Todas</option>
            {cores.map(item => (
              <option key={item.id} value={item.id}>
                {item.nome}
              </option>
            ))}
          </select>
        </S.CampoFiltro>

        <S.CampoFiltro>
          <label htmlFor="precoMaximo">Preço até (R$)</label>
          <input
            id="precoMaximo"
            type="number"
            min={0}
            step="10"
            placeholder="Sem limite"
            value={precoMaximo}
            onChange={evento => setPrecoMaximo(evento.target.value)}
          />
        </S.CampoFiltro>
      </S.Filtros>

      {isLoading ? (
        <CatalogoSkeleton />
      ) : produtos.length === 0 ? (
        <S.Vazio>
          <strong>Nenhum produto encontrado</strong>
          <p>
            Tente ajustar ou limpar os filtros para ver mais opções do catálogo.
          </p>
          <S.Voltar type="button" onClick={limparFiltros}>
            Limpar filtros
          </S.Voltar>
        </S.Vazio>
      ) : (
        <>
          <S.Resultado>{total} produto(s) encontrado(s)</S.Resultado>

          <S.Grade>
            {produtos.map(produto => (
              <ProdutoCard key={produto.id} produto={produto} />
            ))}
          </S.Grade>
        </>
      )}
    </S.Container>
  );
};

export default Catalogo;
