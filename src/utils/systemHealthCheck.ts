/**
 * Sistema de verificação de saúde para as funcionalidades de contas a pagar e receber
 * Este arquivo ajuda a diagnosticar problemas rapidamente
 */

import { supabase } from '@/integrations/supabase/client';
import { 
  mapFrontendPayableToDatabase, 
  mapDatabasePayableToFrontend,
  mapFrontendReceivableToDatabase,
  mapDatabaseReceivableToFrontend 
} from './statusMappings';

export interface HealthCheckResult {
  check: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: any;
}

/**
 * Verifica se os mapeamentos de status estão funcionando corretamente
 */
export const checkStatusMappings = (): HealthCheckResult[] => {
  const results: HealthCheckResult[] = [];
  
  try {
    // Test payable status mappings
    const payableStatuses = ['pendente', 'pago', 'atrasado', 'parcial'] as const;
    for (const status of payableStatuses) {
      const dbStatus = mapFrontendPayableToDatabase(status);
      const backToFrontend = mapDatabasePayableToFrontend(dbStatus);
      
      if (backToFrontend === status) {
        results.push({
          check: `Payable Status Mapping: ${status}`,
          status: 'success',
          message: `${status} -> ${dbStatus} -> ${backToFrontend}`,
        });
      } else {
        results.push({
          check: `Payable Status Mapping: ${status}`,
          status: 'error',
          message: `Mapping error: ${status} -> ${dbStatus} -> ${backToFrontend}`,
        });
      }
    }
    
    // Test receivable status mappings
    const receivableStatuses = ['pendente', 'recebido', 'atrasado', 'parcial'] as const;
    for (const status of receivableStatuses) {
      const dbStatus = mapFrontendReceivableToDatabase(status);
      const backToFrontend = mapDatabaseReceivableToFrontend(dbStatus);
      
      if (backToFrontend === status) {
        results.push({
          check: `Receivable Status Mapping: ${status}`,
          status: 'success',
          message: `${status} -> ${dbStatus} -> ${backToFrontend}`,
        });
      } else {
        results.push({
          check: `Receivable Status Mapping: ${status}`,
          status: 'error',
          message: `Mapping error: ${status} -> ${dbStatus} -> ${backToFrontend}`,
        });
      }
    }
  } catch (error) {
    results.push({
      check: 'Status Mappings',
      status: 'error',
      message: `Error testing status mappings: ${error}`,
    });
  }
  
  return results;
};

/**
 * Verifica se as funções do banco de dados estão disponíveis
 */
export const checkDatabaseFunctions = async (): Promise<HealthCheckResult[]> => {
  const results: HealthCheckResult[] = [];
  
  try {
    // Check if registrar_recebimento function exists
    const { data: receivableFunc, error: receivableError } = await supabase
      .rpc('registrar_recebimento', {
        p_receivable_id: '00000000-0000-0000-0000-000000000000',
        p_received_date: '2024-01-01',
        p_bank_account_id: '00000000-0000-0000-0000-000000000000'
      });
    
    if (receivableError && receivableError.message.includes('function registrar_recebimento')) {
      results.push({
        check: 'Database Function: registrar_recebimento',
        status: 'error',
        message: 'Function does not exist in database',
        details: receivableError
      });
    } else {
      results.push({
        check: 'Database Function: registrar_recebimento',
        status: 'success',
        message: 'Function exists and is callable',
      });
    }
    
    // Check if registrar_pagamento function exists
    const { data: payableFunc, error: payableError } = await supabase
      .rpc('registrar_pagamento', {
        p_payable_id: '00000000-0000-0000-0000-000000000000',
        p_paid_date: '2024-01-01'
      });
    
    if (payableError && payableError.message.includes('function registrar_pagamento')) {
      results.push({
        check: 'Database Function: registrar_pagamento',
        status: 'error',
        message: 'Function does not exist in database',
        details: payableError
      });
    } else {
      results.push({
        check: 'Database Function: registrar_pagamento',
        status: 'success',
        message: 'Function exists and is callable',
      });
    }
  } catch (error) {
    results.push({
      check: 'Database Functions',
      status: 'error',
      message: `Error checking database functions: ${error}`,
    });
  }
  
  return results;
};

/**
 * Verifica se as tabelas estão acessíveis
 */
export const checkDatabaseAccess = async (): Promise<HealthCheckResult[]> => {
  const results: HealthCheckResult[] = [];
  
  try {
    // Check if accounts_payable table is accessible
    const { data: payableData, error: payableError } = await supabase
      .from('accounts_payable')
      .select('id')
      .limit(1);
    
    if (payableError) {
      results.push({
        check: 'Database Access: accounts_payable',
        status: 'error',
        message: 'Cannot access accounts_payable table',
        details: payableError
      });
    } else {
      results.push({
        check: 'Database Access: accounts_payable',
        status: 'success',
        message: 'Table accessible',
      });
    }
    
    // Check if accounts_receivable table is accessible
    const { data: receivableData, error: receivableError } = await supabase
      .from('accounts_receivable')
      .select('id')
      .limit(1);
    
    if (receivableError) {
      results.push({
        check: 'Database Access: accounts_receivable',
        status: 'error',
        message: 'Cannot access accounts_receivable table',
        details: receivableError
      });
    } else {
      results.push({
        check: 'Database Access: accounts_receivable',
        status: 'success',
        message: 'Table accessible',
      });
    }
    
    // Check if bank_accounts table is accessible
    const { data: bankData, error: bankError } = await supabase
      .from('bank_accounts')
      .select('id')
      .limit(1);
    
    if (bankError) {
      results.push({
        check: 'Database Access: bank_accounts',
        status: 'error',
        message: 'Cannot access bank_accounts table',
        details: bankError
      });
    } else {
      results.push({
        check: 'Database Access: bank_accounts',
        status: 'success',
        message: 'Table accessible',
      });
    }
  } catch (error) {
    results.push({
      check: 'Database Access',
      status: 'error',
      message: `Error checking database access: ${error}`,
    });
  }
  
  return results;
};

/**
 * Executa todas as verificações de saúde do sistema
 */
export const runSystemHealthCheck = async (): Promise<HealthCheckResult[]> => {
  console.log('🔍 Iniciando verificação de saúde do sistema...');
  
  const results: HealthCheckResult[] = [];
  
  // Check status mappings
  results.push(...checkStatusMappings());
  
  // Check database functions
  results.push(...await checkDatabaseFunctions());
  
  // Check database access
  results.push(...await checkDatabaseAccess());
  
  // Summary
  const successCount = results.filter(r => r.status === 'success').length;
  const warningCount = results.filter(r => r.status === 'warning').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  
  console.log(`✅ Verificação concluída: ${successCount} sucessos, ${warningCount} avisos, ${errorCount} erros`);
  
  if (errorCount > 0) {
    console.error('❌ Problemas encontrados:');
    results.filter(r => r.status === 'error').forEach(r => {
      console.error(`  - ${r.check}: ${r.message}`);
    });
  }
  
  return results;
};

/**
 * Função helper para usar no console do navegador
 */
export const debugAccountsSystem = async () => {
  const results = await runSystemHealthCheck();
  console.table(results.map(r => ({
    Check: r.check,
    Status: r.status,
    Message: r.message
  })));
  return results;
};