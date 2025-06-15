
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle,
  Settings,
  User,
  Database,
  Mail,
  Building
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';
import { ClienteForm } from './ClienteForm';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { clientSchema, ClientFormValues } from './clienteSchema';
import { Form } from '@/components/ui/form';

type SaasClient = Tables<'saas_clients'>;

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  completed: boolean;
}

interface ClientOnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (clientId: string) => void;
}

export function ClientOnboardingWizard({ isOpen, onClose, onComplete }: ClientOnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [clientData, setClientData] = useState<SaasClient | null>(null);
  const { toast } = useToast();

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      company_name: "",
      contact_name: "",
      contact_email: "",
      contact_phone: "",
      cnpj: "",
      address: "",
      city: "",
      state: "",
      status: "trial",
    },
  });

  const steps: OnboardingStep[] = [
    {
      id: 'client-info',
      title: 'Informações do Cliente',
      description: 'Dados básicos da empresa e contato',
      icon: Building,
      completed: !!clientData
    },
    {
      id: 'setup',
      title: 'Configuração Inicial',
      description: 'Configurar estrutura básica do sistema',
      icon: Settings,
      completed: false
    },
    {
      id: 'admin-user',
      title: 'Usuário Administrador',
      description: 'Criar primeiro usuário administrador',
      icon: User,
      completed: false
    },
    {
      id: 'initial-data',
      title: 'Dados Iniciais',
      description: 'Configurar dados básicos do sistema',
      icon: Database,
      completed: false
    },
    {
      id: 'welcome-email',
      title: 'Email de Boas-vindas',
      description: 'Enviar email de boas-vindas ao cliente',
      icon: Mail,
      completed: false
    }
  ];

  const currentStepData = steps[currentStep];
  const totalSteps = steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const createClient = async (data: ClientFormValues) => {
    setLoading(true);
    try {
      const { data: newClient, error } = await supabase
        .from('saas_clients')
        .insert([{
          company_name: data.company_name,
          contact_name: data.contact_name,
          contact_email: data.contact_email,
          contact_phone: data.contact_phone || null,
          cnpj: data.cnpj || null,
          address: data.address || null,
          city: data.city || null,
          state: data.state || null,
          status: data.status,
        }])
        .select()
        .single();

      if (error) throw error;

      setClientData(newClient);
      
      // Criar registro de onboarding
      const { error: onboardingError } = await supabase
        .from('client_onboarding')
        .insert({
          client_id: newClient.id,
          setup_completed: false,
          admin_user_created: false,
          initial_data_created: false,
          welcome_email_sent: false
        });

      if (onboardingError) throw onboardingError;

      toast({
        title: 'Cliente Criado',
        description: 'Cliente criado com sucesso. Continuando com o onboarding...',
      });

      setCurrentStep(1);
    } catch (error) {
      console.error('Error creating client:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao criar cliente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const completeOnboardingStep = async (stepKey: string) => {
    if (!clientData) return;

    setLoading(true);
    try {
      const updateData: any = { [stepKey]: true };
      
      // Se for o último passo, marcar data de conclusão
      if (currentStep === totalSteps - 1) {
        updateData.onboarding_completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('client_onboarding')
        .update(updateData)
        .eq('client_id', clientData.id);

      if (error) throw error;

      toast({
        title: 'Passo Concluído',
        description: `${currentStepData.title} concluído com sucesso.`,
      });

      if (currentStep === totalSteps - 1) {
        // Onboarding completo
        toast({
          title: 'Onboarding Concluído',
          description: 'Cliente configurado com sucesso!',
        });
        onComplete(clientData.id);
      } else {
        setCurrentStep(currentStep + 1);
      }
    } catch (error) {
      console.error('Error completing onboarding step:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao completar passo do onboarding.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 0) {
      form.handleSubmit(createClient)();
    } else {
      const stepKeys = ['setup_completed', 'admin_user_created', 'initial_data_created', 'welcome_email_sent'];
      completeOnboardingStep(stepKeys[currentStep - 1]);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Form {...form}>
            <form className="space-y-4">
              <ClienteForm form={form} />
            </form>
          </Form>
        );
      
      case 1:
        return (
          <div className="text-center py-8">
            <Settings className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-semibold mb-2">Configuração Inicial</h3>
            <p className="text-muted-foreground mb-6">
              Configurando estrutura básica do sistema para {clientData?.company_name}
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm">
                ✓ Configurar banco de dados<br/>
                ✓ Criar estruturas básicas<br/>
                ✓ Configurar permissões
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="text-center py-8">
            <User className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-semibold mb-2">Usuário Administrador</h3>
            <p className="text-muted-foreground mb-6">
              Criando primeiro usuário administrador para {clientData?.company_name}
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm">
                ✓ Criar usuário admin<br/>
                ✓ Configurar permissões<br/>
                ✓ Definir acesso inicial
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="text-center py-8">
            <Database className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-semibold mb-2">Dados Iniciais</h3>
            <p className="text-muted-foreground mb-6">
              Configurando dados básicos do sistema
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm">
                ✓ Configurar categorias padrão<br/>
                ✓ Criar planos de conta<br/>
                ✓ Configurar relatórios básicos
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="text-center py-8">
            <Mail className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-semibold mb-2">Email de Boas-vindas</h3>
            <p className="text-muted-foreground mb-6">
              Enviando email de boas-vindas para {clientData?.contact_email}
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm">
                ✓ Enviar credenciais de acesso<br/>
                ✓ Manual de primeiros passos<br/>
                ✓ Informações de suporte
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Onboarding de Novo Cliente</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Passo {currentStep + 1} de {totalSteps}: {currentStepData.title}
              </p>
            </div>
            <Button variant="ghost" onClick={onClose}>
              ✕
            </Button>
          </div>
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progresso</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="mb-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <currentStepData.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold">{currentStepData.title}</h3>
                <p className="text-sm text-muted-foreground">{currentStepData.description}</p>
              </div>
            </div>
          </div>

          {renderStepContent()}

          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0 || loading}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={loading}
            >
              {loading ? (
                'Processando...'
              ) : currentStep === totalSteps - 1 ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Finalizar
                </>
              ) : (
                <>
                  Próximo
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
