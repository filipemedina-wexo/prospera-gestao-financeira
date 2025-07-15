import { SignupForm } from "@/components/SignupForm";
import { TrendingUp } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function SignupPage() {
  const navigate = useNavigate();

  const handleSignupSuccess = () => {
    // Redirect to login page after successful signup
    navigate('/login?message=Conta criada com sucesso! Faça login para continuar.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-800">Prospera</span>
          </Link>
        </div>

        {/* Signup Form */}
        <SignupForm onSuccess={handleSignupSuccess} />

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-slate-600">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}