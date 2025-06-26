
import { 
  LayoutDashboard, 
  CreditCard, 
  PiggyBank, 
  BarChart3, 
  Settings, 
  Building2, 
  Users, 
  ShoppingCart, 
  Package,
  UserCheck,
  Shield
} from "lucide-react";

export const menuItems = [
  {
    id: "dashboard",
    title: "Dashboard",
    icon: LayoutDashboard,
    permission: "dashboard.view"
  },
  {
    id: "contas-pagar",
    title: "Contas a Pagar",
    icon: CreditCard,
    permission: "contas-pagar.view"
  },
  {
    id: "contas-receber",
    title: "Contas a Receber",
    icon: PiggyBank,
    permission: "contas-receber.view"
  },
  {
    id: "caixa",
    title: "Caixa",
    icon: PiggyBank,
    permission: "caixa.view"
  },
  {
    id: "fornecedores",
    title: "Fornecedores",
    icon: Building2,
    permission: "fornecedores.view"
  },
  {
    id: "crm",
    title: "CRM",
    icon: Users,
    permission: "crm.view"
  },
  {
    id: "comercial",
    title: "Comercial",
    icon: ShoppingCart,
    permission: "comercial.view"
  },
  {
    id: "produtos-servicos",
    title: "Produtos/Serviços",
    icon: Package,
    permission: "produtos-servicos.view"
  },
  {
    id: "pessoas",
    title: "Pessoas",
    icon: UserCheck,
    permission: "pessoas.view"
  },
  {
    id: "dre",
    title: "DRE",
    icon: BarChart3,
    permission: "dre.view"
  },
  {
    id: "relatorios",
    title: "Relatórios",
    icon: BarChart3,
    permission: "relatorios.view"
  },
  {
    id: "configuracoes",
    title: "Configurações",
    icon: Settings,
    permission: "configuracoes.view"
  },
  {
    id: "admin-saas",
    title: "Admin SaaS",
    icon: Shield,
    permission: "saas.manage"
  }
];
