import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Proposta, Vendedor } from "@/components/modules/comercial/types";
import { Client } from "@/components/modules/crm/types";
import { ProdutoServico } from "@/components/modules/produtos-servicos/types";
import {
  initialPropostas,
  initialVendedores,
  initialClients,
  initialProdutosServicos,
} from "@/data/mocks";
import { ContaReceber } from "@/components/modules/contas-receber/types";

// Este hook agora gerencia apenas os dados que são verdadeiramente estáticos/mockados.
export const useAppData = () => {
  const { toast } = useToast();

  const [propostas, setPropostas] = useState<Proposta[]>(initialPropostas);
  const [vendedores] = useState<Vendedor[]>(initialVendedores);
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [produtosServicos, setProdutosServicos] = useState<ProdutoServico[]>(initialProdutosServicos);
  
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
    produtosServicos,
    setProdutosServicos,
  };
};