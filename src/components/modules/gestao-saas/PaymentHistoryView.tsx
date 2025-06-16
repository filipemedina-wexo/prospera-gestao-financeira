
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CreditCard, 
  Plus,
  Calendar,
  DollarSign
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type SaasClient = Tables<'saas_clients'>;
type PaymentHistory = Tables<'saas_payment_history'>;

interface PaymentHistoryViewProps {
  isOpen: boolean;
  onClose: () => void;
  client: SaasClient;
}

export function PaymentHistoryView({ isOpen, onClose, client }: PaymentHistoryViewProps) {
  const [payments, setPayments] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && client) {
      fetchPaymentHistory();
    }
  }, [isOpen, client]);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      
      // First, get the subscription for this client
      const { data: subscription, error: subError } = await supabase
        .from('saas_subscriptions')
        .select('id')
        .eq('client_id', client.id)
        .maybeSingle();

      if (subError) throw subError;

      if (!subscription) {
        setPayments([]);
        return;
      }

      // Then get the payment history for that subscription
      const { data, error } = await supabase
        .from('saas_payment_history')
        .select('*')
        .eq('subscription_id', subscription.id)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching payment history:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar histórico de pagamentos.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { label: 'Concluído', variant: 'default' as const },
      pending: { label: 'Pendente', variant: 'secondary' as const },
      failed: { label: 'Falhou', variant: 'destructive' as const },
      refunded: { label: 'Reembolsado', variant: 'outline' as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || 
                  { label: status, variant: 'outline' as const };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const totalRevenue = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Histórico de Pagamentos: {client.company_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resumo */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Pagamentos</p>
                    <p className="text-2xl font-bold">{payments.length}</p>
                  </div>
                  <CreditCard className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Receita Total</p>
                    <p className="text-2xl font-bold">
                      R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Último Pagamento</p>
                    <p className="text-lg font-bold">
                      {payments.length > 0 
                        ? new Date(payments[0].payment_date).toLocaleDateString('pt-BR')
                        : 'N/A'
                      }
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Pagamentos */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Histórico de Transações</CardTitle>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Pagamento
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center text-muted-foreground">Carregando pagamentos...</p>
              ) : payments.length > 0 ? (
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <CreditCard className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              R$ {payment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                            {getStatusBadge(payment.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(payment.payment_date).toLocaleDateString('pt-BR')} às{' '}
                            {new Date(payment.payment_date).toLocaleTimeString('pt-BR')}
                          </p>
                          {payment.payment_method && (
                            <p className="text-xs text-muted-foreground capitalize">
                              Método: {payment.payment_method}
                            </p>
                          )}
                          {payment.transaction_id && (
                            <p className="text-xs text-muted-foreground">
                              ID: {payment.transaction_id}
                            </p>
                          )}
                          {payment.notes && (
                            <p className="text-xs text-muted-foreground">
                              {payment.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm font-medium">{payment.currency}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(payment.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum pagamento encontrado</p>
                  <p className="text-sm">Os pagamentos aparecerão aqui quando processados</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
