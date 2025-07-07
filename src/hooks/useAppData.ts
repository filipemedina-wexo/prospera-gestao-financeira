import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Proposta, Vendedor } from "@/components/modules/comercial/types";
import { Client } from "@/components/modules/crm/types";

// Mock data definitions moved here since external files were removed
const initialPropostas: Proposta[] = [];
const initialVendedores: Vendedor[] = [];
const initialClients: Client[] = [];

// Este hook agora gerencia apenas os dados que são verdadeiramente estáticos/mockados.
export const useAppData = () => {
  const { toast } = useToast();

  const [propostas, setPropostas] = useState<Proposta[]>(initialPropostas);
  const [vendedores] = useState<Vendedor[]>(initialVendedores);
  const [clients, setClients] = useState<Client[]>(initialClients);
  
  // As contas a pagar e receber foram removidas daqui.

  const handlePropostaAceita = (proposta: Proposta) => {
    // Esta função precisaria ser movida ou usar uma mutação para criar uma conta a receber real.
    // Por enquanto, vamos manter a notificação.
    toast({
        title: "Proposta Aceita!",
        description: `A proposta "${proposta.titulo}" foi aceita. Uma conta a receber será gerada.`,
        className: "bg-green-100 text-green-800",
      });
  };
  
  return {
    propostas,
    setPropostas,
    vendedores,
    handlePropostaAceita,
    clients,
    setClients,
  };
};