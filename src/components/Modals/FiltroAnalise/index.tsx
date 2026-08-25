/**
 * [VIEW] FiltroAnalise
 *
 * O QUE FAZ: modal de filtro do painel gerencial.
 *
 * COMO FARÁ: traz os campos de data de início e fim e a seleção múltipla de categorias.
 * Bloqueia o aplicar quando a data de fim é anterior à de início (RF0056)
 * ou quando o intervalo sai da faixa de 1 a 24 meses (RN0072).
 *
 * ATENDE: RF0056, RF0057, RN0072
 */

'use client';

import { useEffect, useState } from 'react';

import PrimaryButton from '@/components/Buttons/Primary/button';
import SecondaryButton from '@/components/Buttons/Secondary/button';
import Modal from '@/components/Modals';
import { validarFiltro } from '@/controllers/analise/useAnaliseVendasController';
import { useDominiosController } from '@/controllers/dominios/useDominiosController';
import { AnaliseFiltro } from '@/types/analise/types';

import * as S from './styles';

interface FiltroAnaliseProps {
  aberto: boolean;
  onClose: () => void;
  filtro: AnaliseFiltro;
  onAplicar: (filtro: AnaliseFiltro) => void;
}

const FiltroAnalise = ({
  aberto,
  onClose,
  filtro,
  onAplicar,
}: FiltroAnaliseProps) => {
  const { categorias } = useDominiosController();
  const [rascunho, setRascunho] = useState<AnaliseFiltro>(filtro);

  // Reabrir o modal recomeça do filtro que está valendo na tela.
  useEffect(() => {
    if (aberto) setRascunho(filtro);
  }, [aberto, filtro]);

  // RF0056 e RN0072 reunidas no mesmo validador do controller.
  const erro = validarFiltro(rascunho);

  const alternarCategoria = (categoriaId: number) => {
    setRascunho(atual => ({
      ...atual,
      categoriaIds: atual.categoriaIds.includes(categoriaId)
        ? atual.categoriaIds.filter(id => id !== categoriaId)
        : [...atual.categoriaIds, categoriaId],
    }));
  };

  return (
    <Modal
      aberto={aberto}
      titulo="Filtrar análise de vendas"
      onClose={onClose}
      acoes={
        <>
          <SecondaryButton label="Cancelar" onClick={onClose} />
          <PrimaryButton
            label="Aplicar filtro"
            disabled={!!erro}
            onClick={() => {
              onAplicar(rascunho);
              onClose();
            }}
          />
        </>
      }
    >
      <S.Grid>
        <S.Campo>
          <S.Label htmlFor="dataInicio">Data de início</S.Label>
          <S.Input
            id="dataInicio"
            type="date"
            value={rascunho.dataInicio}
            onChange={evento =>
              setRascunho(atual => ({
                ...atual,
                dataInicio: evento.target.value,
              }))
            }
          />
        </S.Campo>

        <S.Campo>
          <S.Label htmlFor="dataFim">Data de fim</S.Label>
          <S.Input
            id="dataFim"
            type="date"
            value={rascunho.dataFim}
            onChange={evento =>
              setRascunho(atual => ({ ...atual, dataFim: evento.target.value }))
            }
          />
        </S.Campo>
      </S.Grid>

      {/* RF0057: uma ou mais categorias comparadas no mesmo gráfico. */}
      <S.Campo>
        <S.Label>Categorias para comparar</S.Label>
        <S.Opcoes>
          {categorias.map(categoria => (
            <S.Checkbox key={categoria.id}>
              <input
                type="checkbox"
                checked={rascunho.categoriaIds.includes(categoria.id)}
                onChange={() => alternarCategoria(categoria.id)}
              />
              {categoria.nome}
            </S.Checkbox>
          ))}
        </S.Opcoes>
      </S.Campo>

      {erro ? (
        <S.Erro>{erro}</S.Erro>
      ) : (
        <S.Aviso>
          O período deve ter entre 1 e 24 meses, e o agrupamento é sempre
          mensal.
        </S.Aviso>
      )}
    </Modal>
  );
};

export default FiltroAnalise;
