
import { Home, Wallet, CreditCard, PiggyBank, TrendingUp, Package, BarChart3, FileText, Settings, Users, Briefcase } from "lucide-react";

export const menuItems = [
  { title: "Dashboard", icon: Home, id: "dashboard", permission: "dashboard.view" },
  { title: "Caixa", icon: Wallet, id: "caixa", permission: "caixa.view" },
  { title: "Contas a Pagar", icon: CreditCard, id: "contas-pagar", permission: "contas-pagar.view" },
  { title: "Contas a Receber", icon: PiggyBank, id: "contas-receber", permission: "contas-receber.view" },
  { title: "Comercial", icon: TrendingUp, id: "comercial", permission: "comercial.view" },
  { title: "Fornecedores", icon: Briefcase, id: "fornecedores", permission: "fornecedores.view" },
  { title: "Produtos/Serviços", icon: Package, id: "produtos-servicos", permission: "produtos-servicos.view" },
  { title: "Relatórios", icon: BarChart3, id: "relatorios", permission: "relatorios.view" },
  { title: "DRE", icon: FileText, id: "dre", permission: "dre.view" },
  { title: "Configurações", icon: Settings, id: "configuracoes", permission: "configuracoes.view" },
  { title: "CRM", icon: Users, id: "crm", permission: "crm.view" },
];
