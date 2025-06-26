
import { Alert } from '@/types/alert';
import { accountsPayableService } from './accountsPayableService';
import { accountsReceivableService } from './accountsReceivableService';
import { isToday, isPast, parseISO, format, differenceInDays } from 'date-fns';

export const alertsService = {
  async getAll(): Promise<Alert[]> {
    try {
      const [contasPagar, contasReceber] = await Promise.all([
        accountsPayableService.getAll(),
        accountsReceivableService.getAll()
      ]);

      const alerts: Alert[] = [];

      // Alertas de contas a pagar
      contasPagar.forEach(conta => {
        const dataVencimento = parseISO(conta.due_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (conta.status === 'pending') {
          if (isPast(dataVencimento) && !isToday(dataVencimento)) {
            alerts.push({
              id: `pagar-${conta.id}`,
              title: 'Conta em Atraso',
              description: `${conta.description} - Venceu em ${format(dataVencimento, 'dd/MM/yyyy')}`,
              type: 'Atrasado',
              amount: conta.amount,
              category: 'contas-pagar',
              dueDate: format(dataVencimento, 'yyyy-MM-dd'),
              resolved: false
            });
          } else if (isToday(dataVencimento)) {
            alerts.push({
              id: `pagar-${conta.id}`,
              title: 'Conta Vence Hoje',
              description: `${conta.description} - Vence hoje`,
              type: 'Vencendo hoje',
              amount: conta.amount,
              category: 'contas-pagar',
              dueDate: format(dataVencimento, 'yyyy-MM-dd'),
              resolved: false
            });
          }
        }
      });

      // Alertas de contas a receber
      contasReceber.forEach(conta => {
        const dataVencimento = parseISO(conta.due_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (conta.status === 'pending') {
          if (isPast(dataVencimento) && !isToday(dataVencimento)) {
            alerts.push({
              id: `receber-${conta.id}`,
              title: 'Recebimento em Atraso',
              description: `${conta.description} - Venceu em ${format(dataVencimento, 'dd/MM/yyyy')}`,
              type: 'Atrasado',
              amount: conta.amount,
              category: 'contas-receber',
              dueDate: format(dataVencimento, 'yyyy-MM-dd'),
              resolved: false
            });
          } else if (isToday(dataVencimento)) {
            alerts.push({
              id: `receber-${conta.id}`,
              title: 'Conta a Receber Vence Hoje',
              description: `${conta.description} - Vence hoje`,
              type: 'Vencendo hoje',
              amount: conta.amount,
              category: 'contas-receber',
              dueDate: format(dataVencimento, 'yyyy-MM-dd'),
              resolved: false
            });
          } else {
            const diasParaVencimento = differenceInDays(dataVencimento, today);
            if (diasParaVencimento <= 7 && diasParaVencimento > 0) {
              alerts.push({
                id: `receber-${conta.id}`,
                title: 'Recebimento Próximo',
                description: `${conta.description} - Vence em ${diasParaVencimento} dia(s)`,
                type: 'A Receber',
                amount: conta.amount,
                category: 'contas-receber',
                dueDate: format(dataVencimento, 'yyyy-MM-dd'),
                resolved: false
              });
            }
          }
        }
      });

      // Ordenar por data de vencimento (mais antigos primeiro)
      return alerts.sort((a, b) => {
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        return 0;
      });

    } catch (error) {
      console.error('Erro ao buscar alertas:', error);
      return [];
    }
  }
};
