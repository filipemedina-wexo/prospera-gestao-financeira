
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { TrendingUp, Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const { login, signUp, loading: authLoading, user } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user && !authLoading) {
      console.log('User authenticated, redirecting to dashboard');
      navigate('/dashboard');
    }
  }, [user, navigate, authLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    
    try {
      if (isSignUp) {
        console.log('Submitting signup form');
        const { error } = await signUp({ email, password, fullName });
        if (!error) {
          setIsSignUp(false);
          setPassword('');
        }
      } else {
        console.log('Submitting login form');
        const { error } = await login(email, password);
        if (!error) {
          console.log('Login successful, will redirect via useEffect');
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Show loading during auth initialization
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <Card className="w-full max-w-sm">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <p className="text-sm text-muted-foreground">Carregando...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Don't render login form if user is already authenticated
  if (user) {
    return null;
  }

  const isFormDisabled = formSubmitting || authLoading;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Prospera</CardTitle>
          <CardDescription>
            {isSignUp ? 'Crie sua conta para começar.' : 'Entre com seu email e senha para acessar.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome Completo</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Seu nome completo"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isFormDisabled}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="exemplo@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isFormDisabled}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isFormDisabled}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isFormDisabled}>
              {formSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Aguarde...
                </>
              ) : (
                isSignUp ? 'Cadastrar' : 'Entrar'
              )}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            {isSignUp ? 'Já tem uma conta?' : 'Não tem uma conta?'}
            <Button 
              variant="link" 
              onClick={() => setIsSignUp(!isSignUp)} 
              className="pl-1"
              disabled={isFormDisabled}
            >
              {isSignUp ? 'Entrar' : 'Cadastre-se'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
