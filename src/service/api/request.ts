/**
 * [MODEL] Cliente HTTP genérico
 *
 * O QUE FAZ: centraliza a chamada HTTP que os services vão usar quando o
 * back-end existir. Fica pronto desde já, mas NÃO é chamado enquanto todo
 * o Model estiver mockado.
 *
 * COMO FARÁ: expõe `api<T>(path, { method, body })` sobre fetch, lendo a
 * base em `process.env.NEXT_PUBLIC_API_URL`, injetando o Bearer token do
 * localStorage, tratando respostas sem corpo (204) e convertendo erro em
 * `Error` com a mensagem devolvida pela API — que o handleToast já sabe
 * traduzir. Quando a integração acontecer, é o corpo dos services que
 * troca de mock para `api()`; controllers e telas não mudam.
 *
 * ATENDE: infraestrutura de integração futura
 */

import { localStorageKeys } from '@/utils/localStorageKeys';

type Metodo = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  method?: Metodo;
  body?: unknown;
  signal?: AbortSignal;
}

const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? '';

/** O token só existe no browser; no SSR a chamada segue sem Authorization. */
const obterToken = (): string | null => {
  if (typeof window === 'undefined') return null;

  return localStorage.getItem(localStorageKeys.accessToken);
};

const extrairMensagemErro = async (resposta: Response): Promise<string> => {
  try {
    const corpo = await resposta.json();

    return (
      corpo?.error?.message ??
      corpo?.message ??
      `Erro ${resposta.status} ao comunicar com o servidor.`
    );
  } catch {
    return `Erro ${resposta.status} ao comunicar com o servidor.`;
  }
};

export const api = async <T>(
  path: string,
  { method = 'GET', body, signal }: RequestOptions = {},
): Promise<T> => {
  const token = obterToken();

  const resposta = await fetch(`${baseUrl}${path}`, {
    method,
    signal,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!resposta.ok) {
    throw new Error(await extrairMensagemErro(resposta));
  }

  // 204 e afins não têm corpo para desserializar.
  if (resposta.status === 204) {
    return undefined as T;
  }

  return (await resposta.json()) as T;
};
