
import { useAuth } from '@/contexts/AuthContext';
import { useMultiTenant } from '@/contexts/MultiTenantContext';
import { Navigate, useLocation } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  
  // Safely try to get multi-tenant context, with fallback if not ready
  let tenantLoading = true;
  let isSupperAdmin = false;
  let hasClientMapping = false;
  let error: string | null = null;
  let retryCount = 0;
  
  try {
    const multiTenantContext = useMultiTenant();
    tenantLoading = multiTenantContext.loading;
    isSupperAdmin = multiTenantContext.isSupperAdmin;
    hasClientMapping = multiTenantContext.hasClientMapping;
    error = multiTenantContext.error;
    retryCount = multiTenantContext.retryCount;
  } catch (error) {
    // Context not ready yet, keep loading state true
    tenantLoading = true;
  }

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex flex-col items-center space-y-4 p-8 bg-white rounded-lg shadow-md">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2 text-center">
            <Skeleton className="h-4 w-[250px] mx-auto" />
            <Skeleton className="h-4 w-[200px] mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Show error state if there's an error and we're not retrying
  if (error && !tenantLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-xl">Erro na Configuração</CardTitle>
            <CardDescription>
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Usuário: {user.email}
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading while tenant data is loading
  if (tenantLoading) {
    const getLoadingMessage = () => {
      if (retryCount === 0) {
        return "Estamos preparando seu ambiente administrativo personalizado. Isso pode levar alguns segundos.";
      } else if (retryCount <= 3) {
        return "Finalizando a configuração do seu painel...";
      } else {
        return "Aguarde, estamos sincronizando os dados da sua conta...";
      }
    };

    const getProgressMessage = () => {
      if (retryCount === 0) {
        return "Configurando...";
      } else {
        return `Sincronizando... (${retryCount}/8)`;
      }
    };

    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-xl">Configurando seu Painel</CardTitle>
            <CardDescription>
              {getLoadingMessage()}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Usuário: {user.email}
            </p>
            <div className="flex items-center justify-center space-x-2">
              <Skeleton className="h-4 w-4 rounded-full animate-pulse" />
              <span className="text-sm">{getProgressMessage()}</span>
            </div>
            {retryCount > 0 && (
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${(retryCount / 8) * 100}%` }}
                ></div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Allow super admins to access the system even without client mappings
  if (isSupperAdmin) {
    return children;
  }

  // Show different message for new users vs existing users without client mappings
  if (!hasClientMapping) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-xl">Conta Criada com Sucesso!</CardTitle>
            <CardDescription>
              Seu painel administrativo está sendo configurado automaticamente. Aguarde alguns instantes.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Usuário: {user.email}
            </p>
            <div className="flex items-center justify-center space-x-2">
              <Skeleton className="h-4 w-4 rounded-full animate-pulse" />
              <span className="text-sm">Finalizando configuração...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
