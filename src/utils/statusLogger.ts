/**
 * Utility for logging status operations to help debug issues
 */

interface StatusLogEntry {
  timestamp: string;
  operation: string;
  table: 'accounts_payable' | 'accounts_receivable';
  oldStatus?: string;
  newStatus: string;
  recordId: string;
  details?: any;
}

class StatusLogger {
  private logs: StatusLogEntry[] = [];
  private maxLogs = 100;

  log(entry: Omit<StatusLogEntry, 'timestamp'>) {
    const logEntry: StatusLogEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
    };

    this.logs.push(logEntry);

    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[STATUS_LOG] ${logEntry.operation} - ${logEntry.table}:`, logEntry);
    }
  }

  logStatusChange(
    table: 'accounts_payable' | 'accounts_receivable',
    recordId: string,
    oldStatus: string | undefined,
    newStatus: string,
    details?: any
  ) {
    this.log({
      operation: 'STATUS_CHANGE',
      table,
      recordId,
      oldStatus,
      newStatus,
      details,
    });
  }

  logStatusValidation(
    table: 'accounts_payable' | 'accounts_receivable',
    recordId: string,
    status: string,
    isValid: boolean,
    details?: any
  ) {
    this.log({
      operation: 'STATUS_VALIDATION',
      table,
      recordId,
      newStatus: status,
      details: { isValid, ...details },
    });
  }

  logServiceCall(
    table: 'accounts_payable' | 'accounts_receivable',
    operation: string,
    recordId: string,
    status: string,
    details?: any
  ) {
    this.log({
      operation: `SERVICE_${operation.toUpperCase()}`,
      table,
      recordId,
      newStatus: status,
      details,
    });
  }

  getLogs(): StatusLogEntry[] {
    return [...this.logs];
  }

  getRecentLogs(count: number = 20): StatusLogEntry[] {
    return this.logs.slice(-count);
  }

  clearLogs() {
    this.logs = [];
  }

  // Helper to validate status for debugging
  validateStatus(table: 'accounts_payable' | 'accounts_receivable', status: string): boolean {
    const validPayableStatuses = ['pending', 'paid', 'overdue', 'partial', 'canceled'];
    const validReceivableStatuses = ['pending', 'received', 'overdue', 'partial', 'paid', 'canceled'];

    const isValid = table === 'accounts_payable' 
      ? validPayableStatuses.includes(status)
      : validReceivableStatuses.includes(status);

    if (!isValid) {
      console.error(`[STATUS_VALIDATION_ERROR] Invalid status "${status}" for table "${table}"`);
      console.error(`Valid statuses for ${table}:`, table === 'accounts_payable' ? validPayableStatuses : validReceivableStatuses);
    }

    return isValid;
  }
}

export const statusLogger = new StatusLogger();

// Helper function to use in components
export const logStatusOperation = (
  table: 'accounts_payable' | 'accounts_receivable',
  operation: string,
  recordId: string,
  status: string,
  details?: any
) => {
  statusLogger.logServiceCall(table, operation, recordId, status, details);
  statusLogger.validateStatus(table, status);
};
