
/**
 * Validation utilities for account statuses
 * This helps ensure data integrity and provides debugging information
 */

import { 
  mapFrontendPayableToDatabase, 
  mapDatabasePayableToFrontend,
  mapFrontendReceivableToDatabase,
  mapDatabaseReceivableToFrontend,
  isValidPayableStatus,
  isValidReceivableStatus,
  FrontendPayableStatus,
  FrontendReceivableStatus,
  DatabasePayableStatus,
  DatabaseReceivableStatus
} from './statusMappings';

/**
 * Validates and logs status conversions for debugging
 */
export const validateStatusConversion = (
  tableType: 'accounts_payable' | 'accounts_receivable',
  frontendStatus: string,
  operation: 'create' | 'update' | 'display'
) => {
  console.log(`[Status Validation] ${operation} operation on ${tableType} with frontend status: ${frontendStatus}`);
  
  try {
    if (tableType === 'accounts_payable') {
      const dbStatus = mapFrontendPayableToDatabase(frontendStatus as FrontendPayableStatus);
      const backToFrontend = mapDatabasePayableToFrontend(dbStatus);
      console.log(`[Status Validation] Payable mapping: ${frontendStatus} -> ${dbStatus} -> ${backToFrontend}`);
      
      if (!isValidPayableStatus(dbStatus)) {
        console.error(`[Status Validation] Invalid payable status: ${dbStatus}`);
        return false;
      }
    } else {
      const dbStatus = mapFrontendReceivableToDatabase(frontendStatus as FrontendReceivableStatus);
      const backToFrontend = mapDatabaseReceivableToFrontend(dbStatus);
      console.log(`[Status Validation] Receivable mapping: ${frontendStatus} -> ${dbStatus} -> ${backToFrontend}`);
      
      if (!isValidReceivableStatus(dbStatus)) {
        console.error(`[Status Validation] Invalid receivable status: ${dbStatus}`);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error(`[Status Validation] Error validating status: ${error}`);
    return false;
  }
};

/**
 * Validates bank account ID to prevent null/undefined values
 */
export const validateBankAccountId = (bankAccountId: string | null | undefined, operation: string): boolean => {
  console.log(`[Bank Account Validation] Checking bank account ID for ${operation}: ${bankAccountId}`);
  
  if (!bankAccountId || bankAccountId.trim() === '') {
    console.error(`[Bank Account Validation] Invalid bank account ID for ${operation}: ${bankAccountId}`);
    return false;
  }
  
  // Basic UUID validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(bankAccountId)) {
    console.error(`[Bank Account Validation] Invalid UUID format for bank account ID: ${bankAccountId}`);
    return false;
  }
  
  console.log(`[Bank Account Validation] Valid bank account ID for ${operation}: ${bankAccountId}`);
  return true;
};

/**
 * Validates date to ensure it's not null and is a valid date
 */
export const validateDate = (date: string | Date | null | undefined, fieldName: string): boolean => {
  console.log(`[Date Validation] Checking ${fieldName}: ${date}`);
  
  if (!date) {
    console.error(`[Date Validation] ${fieldName} is required but was: ${date}`);
    return false;
  }
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    console.error(`[Date Validation] Invalid date for ${fieldName}: ${date}`);
    return false;
  }
  
  console.log(`[Date Validation] Valid date for ${fieldName}: ${dateObj.toISOString()}`);
  return true;
};

/**
 * Comprehensive validation for receivable payment registration
 */
export const validateReceivablePayment = (
  receivableId: string | null | undefined,
  receivedDate: string | Date | null | undefined,
  bankAccountId: string | null | undefined
): boolean => {
  console.log('[Receivable Payment Validation] Starting validation', {
    receivableId,
    receivedDate,
    bankAccountId
  });

  const validations = [
    validateDate(receivedDate, 'received_date'),
    validateBankAccountId(bankAccountId, 'receivable payment'),
    !!receivableId // Basic check for receivable ID
  ];
  
  const isValid = validations.every(v => v === true);
  
  if (!isValid) {
    console.error('[Receivable Payment Validation] Validation failed', {
      receivableId,
      receivedDate,
      bankAccountId
    });
  } else {
    console.log('[Receivable Payment Validation] All validations passed', {
      receivableId,
      receivedDate,
      bankAccountId
    });
  }
  
  return isValid;
};

/**
 * Comprehensive validation for payable payment registration
 */
export const validatePayablePayment = (
  payableId: string | null | undefined,
  paidDate: string | Date | null | undefined,
  bankAccountId: string | null | undefined
): boolean => {
  console.log('[Payable Payment Validation] Starting validation', {
    payableId,
    paidDate,
    bankAccountId
  });

  const validations = [
    validateDate(paidDate, 'paid_date'),
    validateBankAccountId(bankAccountId, 'payable payment'),
    !!payableId // Basic check for payable ID
  ];
  
  const isValid = validations.every(v => v === true);
  
  if (!isValid) {
    console.error('[Payable Payment Validation] Validation failed', {
      payableId,
      paidDate,
      bankAccountId
    });
  } else {
    console.log('[Payable Payment Validation] All validations passed', {
      payableId,
      paidDate,
      bankAccountId
    });
  }
  
  return isValid;
};
