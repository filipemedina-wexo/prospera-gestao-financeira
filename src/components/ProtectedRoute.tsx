
import { useAuth } from '@/contexts/AuthContext';
import { useMultiTenant } from '@/contexts/MultiTenantContext';
import { Navigate, useLocation } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading: authLoading } = useAuth();
  const { loading: tenantLoading, isSupperAdmin, hasClientMapping } = useMultiTenant();
  const location = useLocation();

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

  // Show loading while tenant data is loading
  if (tenantLoading) {
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

  // Allow super admins to access the system even without client mappings
  if (isSupperAdmin) {
    return children;
  }

  // Show warning for regular users without client mappings
  if (!hasClientMapping) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
            <CardTitle className="text-xl">Acesso Pendente</CardTitle>
            <CardDescription>
              Sua conta ainda não foi associada a nenhum cliente. Entre em contato com o administrador do sistema para obter acesso.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">
              Usuário: {user.email}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
