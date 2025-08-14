export function parseSupabaseError(error: any): Record<string, string> {
  const message = (error?.message || '').toLowerCase();
  const details = (error?.details || '').toLowerCase();
  const text = `${message} ${details}`;
  const fieldErrors: Record<string, string> = {};

  if (text.includes('client_id')) {
    fieldErrors.fornecedor = 'Fornecedor inválido ou não informado.';
  }

  if (text.includes('financial_client_id')) {
    fieldErrors.clienteId = 'Cliente inválido ou não informado.';
  }

  if (text.includes('category')) {
    fieldErrors.categoria = 'Categoria inválida ou não informada.';
  }

  if (text.includes('amount')) {
    fieldErrors.valor = 'Valor inválido ou não informado.';
  }

  return fieldErrors;
}
