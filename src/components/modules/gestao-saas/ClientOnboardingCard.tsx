
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  Circle, 
  Settings, 
  User, 
  Database, 
  Mail,
  Play
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type SaasClient = Tables<'saas_clients'>;
type ClientOnboarding = Tables<'client_onboarding'>;

interface ClientOnboardingCardProps {
  client: SaasClient;
  onboardingData?: ClientOnboarding | null;
  onRefresh: () => void;
}

export function ClientOnboardingCard({ client, onboardingData, onRefresh }: ClientOnboardingCardProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const calculateProgress = () => {
    if (!onboardingData) return 0;
    
    const steps = [
      onboardingData.setup_completed,
      onboardingData.admin_user_created,
      onboardingData.initial_data_created,
      onboardingData.welcome_email_sent
    ];
    
    const completedSteps = steps.filter(Boolean).length;
    return (completedSteps / steps.length) * 100;
  };

  const startOnboarding = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('client_onboarding')
        .upsert({
          client_id: client.id,
          setup_completed: false,
          admin_user_created: false,
          initial_data_created: false,
          welcome_email_sent: false
        });

      if (error) throw error;

      toast({
        title: 'Onboarding Iniciado',
        description: 'Processo de onboarding iniciado para o cliente.',
      });

      onRefresh();
    } catch (error) {
      console.error('Error starting onboarding:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao iniciar onboarding.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOnboardingStep = async (step: keyof Pick<ClientOnboarding, 'setup_completed' | 'admin_user_created' | 'initial_data_created' | 'welcome_email_sent'>) => {
    if (!onboardingData) return;

    setLoading(true);
    try {
      const updateData: any = { [step]: !onboardingData[step] };
      
      // Se completando todos os passos, marcar data de conclusão
      const allSteps = [
        step === 'setup_completed' ? !onboardingData[step] : onboardingData.setup_completed,
        step === 'admin_user_created' ? !onboardingData[step] : onboardingData.admin_user_created,
        step === 'initial_data_created' ? !onboardingData[step] : onboardingData.initial_data_created,
        step === 'welcome_email_sent' ? !onboardingData[step] : onboardingData.welcome_email_sent
      ];

      if (allSteps.every(Boolean)) {
        updateData.onboarding_completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('client_onboarding')
        .update(updateData)
        .eq('id', onboardingData.id);

      if (error) throw error;

      toast({
        title: 'Passo Atualizado',
        description: 'Status do onboarding atualizado com sucesso.',
      });

      onRefresh();
    } catch (error) {
      console.error('Error updating onboarding step:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar passo do onboarding.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const onboardingSteps = [
    {
      key: 'setup_completed' as const,
      label: 'Configuração Inicial',
      icon: Settings,
      completed: onboardingData?.setup_completed || false
    },
    {
      key: 'admin_user_created' as const,
      label: 'Usuário Admin Criado',
      icon: User,
      completed: onboardingData?.admin_user_created || false
    },
    {
      key: 'initial_data_created' as const,
      label: 'Dados Iniciais',
      icon: Database,
      completed: onboardingData?.initial_data_created || false
    },
    {
      key: 'welcome_email_sent' as const,
      label: 'Email de Boas-vindas',
      icon: Mail,
      completed: onboardingData?.welcome_email_sent || false
    }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{client.company_name}</CardTitle>
          {onboardingData?.onboarding_completed_at ? (
            <Badge variant="default" className="bg-green-100 text-green-800">
              Completo
            </Badge>
          ) : onboardingData ? (
            <Badge variant="outline" className="bg-blue-100 text-blue-800">
              Em Progresso
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-gray-100 text-gray-800">
              Não Iniciado
            </Badge>
          )}
        </div>
        {onboardingData && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Progresso do Onboarding</span>
              <span>{Math.round(calculateProgress())}%</span>
            </div>
            <Progress value={calculateProgress()} className="h-2" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        {!onboardingData ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-4">
              Onboarding ainda não foi iniciado para este cliente.
            </p>
            <Button onClick={startOnboarding} disabled={loading}>
              <Play className="h-4 w-4 mr-2" />
              Iniciar Onboarding
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {onboardingSteps.map((step) => (
              <div
                key={step.key}
                className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => updateOnboardingStep(step.key)}
              >
                <div className="flex items-center gap-3">
                  <step.icon className="h-4 w-4" />
                  <span className="font-medium">{step.label}</span>
                </div>
                {step.completed ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-400" />
                )}
              </div>
            ))}
            {onboardingData.onboarding_completed_at && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  Onboarding concluído em{' '}
                  {new Date(onboardingData.onboarding_completed_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
