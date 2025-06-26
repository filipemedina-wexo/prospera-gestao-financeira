import { format, subMonths } from 'date-fns';

/**
 * Gera uma lista de competências a partir do mês atual.
 * @param meses Quantidade de meses para retornar. Padrão: 24.
 * @returns Array de competências no formato MM/yyyy
 */
export function gerarCompetencias(meses: number = 24): string[] {
  return Array.from({ length: meses }, (_, i) =>
    format(subMonths(new Date(), meses - i - 1), 'MM/yyyy')
  );
}
