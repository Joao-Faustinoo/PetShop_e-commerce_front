/**
 * [VIEW] Máscaras de entrada
 *
 * O QUE FAZ: formata e valida os campos brasileiros dos formulários.
 *
 * COMO FARÁ: exporta `maskCPF`, `maskCEP`, `maskTelefone`, `maskCartao`
 * (agrupando de quatro em quatro e mascarando os dígitos centrais na
 * exibição) e `maskMoeda`, mais `validarCPF` para o ClienteSchema
 * consumir. Todas trabalham só sobre string, sem dependência de React.
 *
 * ATENDE: RN0023, RN0024, RN0026
 */

export const apenasDigitos = (valor: string): string =>
  valor.replace(/\D/g, '');

export const maskCPF = (valor: string): string =>
  apenasDigitos(valor)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');

export const maskCEP = (valor: string): string =>
  apenasDigitos(valor)
    .slice(0, 8)
    .replace(/(\d{5})(\d)/, '$1-$2');

/** Aceita fixo (8 dígitos) e celular (9 dígitos), sem o DDD. */
export const maskTelefone = (valor: string): string => {
  const digitos = apenasDigitos(valor).slice(0, 9);

  if (digitos.length <= 8) {
    return digitos.replace(/(\d{4})(\d)/, '$1-$2');
  }

  return digitos.replace(/(\d{5})(\d)/, '$1-$2');
};

export const maskDDD = (valor: string): string =>
  apenasDigitos(valor).slice(0, 2);

export const maskCartao = (valor: string): string =>
  apenasDigitos(valor)
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, '$1 ')
    .trim();

/** RN0024: na exibição, só os quatro últimos dígitos ficam visíveis. */
export const mascararCartao = (numero: string): string => {
  const digitos = apenasDigitos(numero);

  if (digitos.length < 4) return digitos;

  return `**** **** **** ${digitos.slice(-4)}`;
};

export const maskCVV = (valor: string): string =>
  apenasDigitos(valor).slice(0, 4);

/** Converte a digitação em centavos e devolve já formatado em reais. */
export const maskMoeda = (valor: string): string => {
  const centavos = Number(apenasDigitos(valor));

  return (centavos / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/** Desfaz `maskMoeda`, devolvendo o número que vai para o payload. */
export const desmascararMoeda = (valor: string): number =>
  Number(apenasDigitos(valor)) / 100;

/**
 * Validação oficial do CPF pelos dois dígitos verificadores. Usada pelo
 * ClienteSchema para cumprir a RN0026.
 */
export const validarCPF = (valor: string): boolean => {
  const cpf = apenasDigitos(valor);

  if (cpf.length !== 11) return false;
  // Sequências de dígitos iguais passam no cálculo, mas não são válidas.
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  const calcularDigito = (quantidade: number): number => {
    const soma = cpf
      .slice(0, quantidade)
      .split('')
      .reduce(
        (total, digito, indice) =>
          total + Number(digito) * (quantidade + 1 - indice),
        0,
      );

    const resto = (soma * 10) % 11;

    return resto >= 10 ? 0 : resto;
  };

  return (
    calcularDigito(9) === Number(cpf[9]) &&
    calcularDigito(10) === Number(cpf[10])
  );
};
