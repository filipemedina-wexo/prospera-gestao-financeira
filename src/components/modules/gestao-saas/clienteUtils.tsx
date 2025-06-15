
import { Badge } from '@/components/ui/badge';
import { Tables } from '@/integrations/supabase/types';

type SaasClientStatus = Tables<'saas_clients'>['status'];

export const getStatusBadge = (status: SaasClientStatus) => {
  const variants: Record<SaasClientStatus, string> = {
    active: 'bg-green-100 text-green-800',
    blocked: 'bg-red-100 text-red-800',
    trial: 'bg-blue-100 text-blue-800',
    suspended: 'bg-yellow-100 text-yellow-800',
  };

  const labels: Record<SaasClientStatus, string> = {
    active: 'Ativo',
    blocked: 'Bloqueado',
    trial: 'Trial',
    suspended: 'Suspenso',
  };

  return (
    <Badge variant="outline" className={variants[status]}>
      {labels[status]}
    </Badge>
  );
};
