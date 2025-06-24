
export type Alert = {
  id: string;
  title: string;
  description: string;
  type: "Atrasado" | "Vencendo hoje" | "A Receber";
  amount: number;
  category: "contas-pagar" | "contas-receber";
  dueDate?: string;
  resolved?: boolean;
};
