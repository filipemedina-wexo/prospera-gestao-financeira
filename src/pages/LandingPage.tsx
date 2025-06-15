
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Check, Users, BarChart3, Shield, CreditCard, FileText, Calculator, Building, Star } from "lucide-react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-800">Prospera</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#beneficios" className="text-slate-600 hover:text-blue-600 transition-colors">
              Benefícios
            </a>
            <a href="#funcionalidades" className="text-slate-600 hover:text-blue-600 transition-colors">
              Funcionalidades
            </a>
            <a href="#planos" className="text-slate-600 hover:text-blue-600 transition-colors">
              Planos
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="outline">Entrar</Button>
            </Link>
            <Link to="/login">
              <Button>Começar Grátis</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-800 mb-6">
            Gerencie suas <span className="text-blue-600">Finanças</span> com
            <br />
            <span className="text-green-600">Inteligência</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            O Prospera é a solução completa para gestão financeira empresarial. 
            Controle contas a pagar e receber, fluxo de caixa, relatórios e muito mais.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button size="lg" className="text-lg px-8 py-3">
                Começar Gratuitamente
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 py-3">
              Ver Demonstração
            </Button>
          </div>
          <p className="text-sm text-slate-500 mt-4">
            ✓ 30 dias grátis • ✓ Sem cartão de crédito • ✓ Suporte completo
          </p>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="beneficios" className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              Por que escolher o Prospera?
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Simplifique sua gestão financeira com uma plataforma completa e intuitiva
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-none shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Controle Total</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Tenha visibilidade completa das suas finanças com dashboards 
                  intuitivos e relatórios detalhados em tempo real.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-none shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">Segurança Garantida</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Seus dados estão protegidos com criptografia de ponta e 
                  backup automático na nuvem.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-none shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Suporte Especializado</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Nossa equipe está sempre disponível para ajudar você a 
                  aproveitar ao máximo a plataforma.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="funcionalidades" className="py-20 px-4 bg-slate-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              Funcionalidades Completas
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Tudo que você precisa para gerenciar suas finanças em um só lugar
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center gap-3 mb-3">
                <CreditCard className="h-6 w-6 text-blue-600" />
                <h3 className="font-semibold">Contas a Pagar e Receber</h3>
              </div>
              <p className="text-slate-600">
                Controle total sobre suas obrigações e direitos financeiros
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center gap-3 mb-3">
                <BarChart3 className="h-6 w-6 text-green-600" />
                <h3 className="font-semibold">Fluxo de Caixa</h3>
              </div>
              <p className="text-slate-600">
                Acompanhe entradas e saídas com projeções inteligentes
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center gap-3 mb-3">
                <FileText className="h-6 w-6 text-purple-600" />
                <h3 className="font-semibold">Relatórios Avançados</h3>
              </div>
              <p className="text-slate-600">
                DRE, Balanço e relatórios personalizados
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center gap-3 mb-3">
                <Building className="h-6 w-6 text-orange-600" />
                <h3 className="font-semibold">Gestão de Fornecedores</h3>
              </div>
              <p className="text-slate-600">
                Cadastro completo e histórico de relacionamento
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center gap-3 mb-3">
                <Users className="h-6 w-6 text-red-600" />
                <h3 className="font-semibold">CRM Integrado</h3>
              </div>
              <p className="text-slate-600">
                Gerencie clientes e oportunidades de vendas
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center gap-3 mb-3">
                <Calculator className="h-6 w-6 text-indigo-600" />
                <h3 className="font-semibold">Comercial e Vendas</h3>
              </div>
              <p className="text-slate-600">
                Propostas, comissões e controle de vendas
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="planos" className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              Planos que Cabem no seu Orçamento
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Escolha o plano ideal para o tamanho da sua empresa
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="relative">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Starter</CardTitle>
                <CardDescription>Ideal para pequenas empresas</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">R$ 49</span>
                  <span className="text-slate-600">/mês</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Até 5 usuários</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Contas a pagar e receber</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Relatórios básicos</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Suporte por email</span>
                  </li>
                </ul>
                <Link to="/login" className="block mt-6">
                  <Button className="w-full">Começar Grátis</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="relative border-blue-500 border-2">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  Mais Popular
                </span>
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Professional</CardTitle>
                <CardDescription>Para empresas em crescimento</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">R$ 149</span>
                  <span className="text-slate-600">/mês</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Até 20 usuários</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Todas as funcionalidades</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Relatórios avançados</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>CRM completo</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Suporte prioritário</span>
                  </li>
                </ul>
                <Link to="/login" className="block mt-6">
                  <Button className="w-full">Começar Grátis</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="relative">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Enterprise</CardTitle>
                <CardDescription>Para grandes empresas</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">R$ 299</span>
                  <span className="text-slate-600">/mês</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Usuários ilimitados</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Multi-empresas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>API personalizada</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Integrações avançadas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Suporte 24/7</span>
                  </li>
                </ul>
                <Link to="/login" className="block mt-6">
                  <Button className="w-full" variant="outline">Falar com Vendas</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">Prospera</span>
              </div>
              <p className="text-slate-400">
                A solução completa para gestão financeira empresarial.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Funcionalidades</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Demonstração</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Sobre nós</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carreiras</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Suporte</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2024 Prospera. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
