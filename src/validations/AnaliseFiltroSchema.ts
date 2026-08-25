/**
 * [MODEL] Schema de validação do filtro de análise
 *
 * O QUE FAZ: valida o filtro do painel gerencial antes de disparar a
 * consulta.
 *
 * COMO FARÁ: objeto yup exigindo data de início, data de fim não anterior
 * à de início (RF0056) e ao menos uma categoria selecionada (RF0057), com
 * um teste próprio garantindo intervalo entre 1 e 24 meses (RN0072).
 * Exporta `IAnaliseFiltroForm`.
 *
 * ATENDE: RF0056, RF0057, RN0072
 */

import * as yup from 'yup';

/** RN0072: o intervalo vai de 1 a 24 meses. */
export const MESES_MINIMO = 1;
export const MESES_MAXIMO = 24;

/** Distância em meses entre duas datas ISO (AAAA-MM-DD). */
export const mesesEntre = (dataInicio: string, dataFim: string): number => {
  const inicio = new Date(`${dataInicio}T00:00:00`);
  const fim = new Date(`${dataFim}T00:00:00`);

  return (
    (fim.getFullYear() - inicio.getFullYear()) * 12 +
    (fim.getMonth() - inicio.getMonth())
  );
};

export const AnaliseFiltroSchema = yup.object({
  dataInicio: yup.string().required('Data de início é obrigatória'),
  dataFim: yup
    .string()
    .required('Data de fim é obrigatória')
    // RF0056: a data de fim não pode ser anterior à de início.
    .test(
      'nao-anterior',
      'A data de fim não pode ser anterior à data de início',
      function validar(valor) {
        const { dataInicio } = this.parent;

        if (!valor || !dataInicio) return true;

        return valor >= dataInicio;
      },
    )
    // RN0072: no mínimo 1 mês e no máximo 24 meses de intervalo.
    .test(
      'intervalo-permitido',
      `O período deve ter entre ${MESES_MINIMO} e ${MESES_MAXIMO} meses`,
      function validar(valor) {
        const { dataInicio } = this.parent;

        if (!valor || !dataInicio || valor < dataInicio) return true;

        const meses = mesesEntre(dataInicio, valor);

        return meses >= MESES_MINIMO && meses <= MESES_MAXIMO;
      },
    ),
  // RF0057: ao menos uma categoria para o gráfico ter o que comparar.
  categoriaIds: yup
    .array()
    .of(yup.number().required())
    .min(1, 'Selecione ao menos uma categoria')
    .required('Selecione ao menos uma categoria'),
});

export type IAnaliseFiltroForm = yup.InferType<typeof AnaliseFiltroSchema>;
