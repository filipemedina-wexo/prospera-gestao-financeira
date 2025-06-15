
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Proposta, Vendedor } from "@/components/modules/comercial/types";
import { ContaReceber } from "@/components/modules/contas-receber/types";
import { ContaPagar } from "@/components/modules/contas-pagar/types";
import {
  initialPropostas,
  initialVendedores,
  initialContasAReceber,
  initialContasAPagar,
} from "@/data/mockData";

export const useAppData = () => {
  const { toast } = useToast();

  const [propostas, setPropostas] = useState<Proposta[]>(initialPropostas);
  const [vendedores] = useState<Vendedor[]>(initialVendedores);
  const [contasAReceber, setContasAReceber] = useState<ContaReceber[]>(initialContasAReceber);
  const [contasAPagar, setContasAPagar] = useState<ContaPagar[]>(initialContasAPagar);

  const handlePropostaAceita = (proposta: Proposta) => {
    const competencia = `${(proposta.dataValidade.getMonth() + 1).toString().padStart(2, '0')}/${proposta.dataValidade.getFullYear()}`;
    const novaConta: ContaReceber = {
      id: `prop-${proposta.id}-${Date.now()}`,
      descricao: `Recebimento da Proposta: ${proposta.titulo}`,
      valor: proposta.valorTotal,
      dataVencimento: proposta.dataValidade,
      status: 'pendente',
      cliente: proposta.cliente,
      categoria: 'Venda de Projeto',
      competencia,
    };

    setContasAReceber(prevContas => [...prevContas, novaConta]);
    toast({
        title: "Sucesso!",
        description: `Conta a Receber para "${proposta.titulo}" foi criada.`,
        className: "bg-green-100 text-green-800",
      });
  };
  
  return {
    propostas,
    setPropostas,
    vendedores,
    contasAReceber,
    setContasAReceber,
    contasAPagar,
    setContasAPagar,
    handlePropostaAceita,
  };
};
