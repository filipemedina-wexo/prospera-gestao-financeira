
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export function AccessDeniedAlert() {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Acesso Negado</AlertTitle>
      <AlertDescription>
        Você não tem permissão para acessar a gestão de usuários.
      </AlertDescription>
    </Alert>
  );
}
