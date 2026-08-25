/**
 * [VIEW] useDebounce
 *
 * O QUE FAZ: atrasa a propagação de um valor que muda rápido — tipicamente
 * o texto de uma busca — para que a consulta não dispare a cada tecla.
 *
 * COMO FARÁ: guarda o valor em estado e só o atualiza depois que o `delay`
 * passa sem novas mudanças, limpando o timeout a cada alteração. A View
 * mantém o input controlado com o valor imediato e entrega ao controller o
 * valor debounced, que vai para a queryKey do useQuery.
 *
 * ATENDE: RF0015, RF0024, RNF0011
 */

import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timeout);
  }, [value, delay]);

  return debouncedValue;
}
