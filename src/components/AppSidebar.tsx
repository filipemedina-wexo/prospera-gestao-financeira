
import {
  Calendar,
  FileText,
  TrendingUp,
  CreditCard,
  PiggyBank,
  BarChart3,
  Settings,
  Home
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { useState } from "react";

const menuItems = [
  {
    title: "Dashboard",
    icon: Home,
    id: "dashboard",
  },
  {
    title: "Contas a Pagar",
    icon: CreditCard,
    id: "contas-pagar",
  },
  {
    title: "Contas a Receber",
    icon: PiggyBank,
    id: "contas-receber",
  },
  {
    title: "Comercial",
    icon: TrendingUp,
    id: "comercial",
  },
  {
    title: "Relatórios",
    icon: BarChart3,
    id: "relatorios",
  },
  {
    title: "DRE",
    icon: FileText,
    id: "dre",
  },
];

interface AppSidebarProps {
  onMenuChange?: (menuId: string) => void;
}

export function AppSidebar({ onMenuChange }: AppSidebarProps) {
  const [activeMenu, setActiveMenu] = useState("dashboard");

  const handleMenuClick = (menuId: string) => {
    setActiveMenu(menuId);
    onMenuChange?.(menuId);
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-6 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg">FinanceFlow</h1>
            <p className="text-sm text-muted-foreground">Sistema Financeiro</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => handleMenuClick(item.id)}
                    className={`w-full justify-start ${
                      activeMenu === item.id ? "bg-primary text-primary-foreground" : ""
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
