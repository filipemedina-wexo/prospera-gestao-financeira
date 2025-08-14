import { Database } from '@/integrations/supabase/types';
import { ACCOUNTS_PAYABLE_STATUS } from '@/components/modules/contas-pagar/types';
import { ACCOUNTS_RECEIVABLE_STATUS } from '@/components/modules/contas-receber/types';

/**
 * Utility functions for status mapping between frontend and database
 * This prevents confusion between accounts_payable and accounts_receivable statuses
 */

// Frontend status types
export type FrontendPayableStatus = 'pendente' | 'pago' | 'atrasado' | 'cancelado';
export type FrontendReceivableStatus = 'pendente' | 'recebido' | 'atrasado' | 'cancelado';

// Database status types
export type DatabasePayableStatus = Database['public']['Tables']['accounts_payable']['Row']['status'];
export type DatabaseReceivableStatus = Database['public']['Tables']['accounts_receivable']['Row']['status'];

/**
 * Maps frontend status to database status for accounts_payable
 */
export const mapFrontendPayableToDatabase = (status: FrontendPayableStatus): DatabasePayableStatus => {
  const mapping: Record<FrontendPayableStatus, DatabasePayableStatus> = {
    pendente: ACCOUNTS_PAYABLE_STATUS.PENDING,
    pago: ACCOUNTS_PAYABLE_STATUS.PAID,
    atrasado: ACCOUNTS_PAYABLE_STATUS.OVERDUE,
    cancelado: ACCOUNTS_PAYABLE_STATUS.CANCELED
  };
  return mapping[status];
};

/**
 * Maps database status to frontend status for accounts_payable
 */
export const mapDatabasePayableToFrontend = (status: DatabasePayableStatus): FrontendPayableStatus => {
  const mapping: Record<DatabasePayableStatus, FrontendPayableStatus> = {
    [ACCOUNTS_PAYABLE_STATUS.PENDING]: 'pendente',
    [ACCOUNTS_PAYABLE_STATUS.PAID]: 'pago',
    [ACCOUNTS_PAYABLE_STATUS.OVERDUE]: 'atrasado',
    [ACCOUNTS_PAYABLE_STATUS.CANCELED]: 'cancelado'
  };
  return mapping[status];
};

/**
 * Maps frontend status to database status for accounts_receivable
 */
export const mapFrontendReceivableToDatabase = (status: FrontendReceivableStatus): DatabaseReceivableStatus => {
  const mapping: Record<FrontendReceivableStatus, DatabaseReceivableStatus> = {
    pendente: ACCOUNTS_RECEIVABLE_STATUS.PENDING,
    recebido: ACCOUNTS_RECEIVABLE_STATUS.RECEIVED,
    atrasado: ACCOUNTS_RECEIVABLE_STATUS.OVERDUE,
    cancelado: ACCOUNTS_RECEIVABLE_STATUS.CANCELED
  };
  return mapping[status];
};

/**
 * Maps database status to frontend status for accounts_receivable
 */
export const mapDatabaseReceivableToFrontend = (status: DatabaseReceivableStatus): FrontendReceivableStatus => {
  const mapping: Record<DatabaseReceivableStatus, FrontendReceivableStatus> = {
    [ACCOUNTS_RECEIVABLE_STATUS.PENDING]: 'pendente',
    [ACCOUNTS_RECEIVABLE_STATUS.RECEIVED]: 'recebido',
    [ACCOUNTS_RECEIVABLE_STATUS.OVERDUE]: 'atrasado',
    [ACCOUNTS_RECEIVABLE_STATUS.CANCELED]: 'cancelado'
  };
  return mapping[status];
};

/**
 * Validates if a status is valid for accounts_payable
 */
export const isValidPayableStatus = (status: string): status is DatabasePayableStatus => {
  return Object.values(ACCOUNTS_PAYABLE_STATUS).includes(status as DatabasePayableStatus);
};

/**
 * Validates if a status is valid for accounts_receivable
 */
export const isValidReceivableStatus = (status: string): status is DatabaseReceivableStatus => {
  return Object.values(ACCOUNTS_RECEIVABLE_STATUS).includes(status as DatabaseReceivableStatus);
};