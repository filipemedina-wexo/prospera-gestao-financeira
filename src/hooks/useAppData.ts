
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Proposta, Vendedor } from "@/components/modules/comercial/types";
import { ContaReceber } from "@/components/modules/contas-receber/types";
import { ContaPagar } from "@/components/modules/contas-pagar/types";
import { Client } from "@/components/modules/crm/types";
import { ProdutoServico } from "@/components/modules/produtos-servicos/types";
import { Fornecedor } from "@/components/modules/fornecedores/types";
import {
  initialPropostas,
  initialVendedores,
  initialContasAReceber,
  initialContasAPagar,
  initialClients,
  initialProdutosServicos,
  initialFornecedores,
} from "@/data/mocks";

export const useAppData = () => {
  const { toast } = useToast();

  const [propostas, setPropostas] = useState<Proposta[]>(initialPropostas);
  const [vendedores] = useState<Vendedor[]>(initialVendedores);
  const [contasAReceber, setContasAReceber] = useState<ContaReceber[]>(initialContasAReceber);
  const [contasAPagar, setContasAPagar] = useState<ContaPagar[]>(initialContasAPagar);
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [produtosServicos, setProdutosServicos] = useState<ProdutoServico[]>(initialProdutosServicos);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>(initialFornecedores);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day

    const checkAndUpdateStatus = <T extends { status: string; dataVencimento: Date }>(
      contas: T[]
    ): { updatedContas: T[]; changed: boolean } => {
      let changed = false;
      const updatedContas = contas.map(conta => {
        if (conta.status === 'pendente' && new Date(conta.dataVencimento) < today) {
          changed = true;
          return { ...conta, status: 'atrasado' as const };
        }
        return conta;
      });
      return { updatedContas, changed };
    };

    setContasAPagar(prevContas => {
      const { updatedContas, changed } = checkAndUpdateStatus(prevContas);
      return changed ? updatedContas : prevContas;
    });
    setContasAReceber(prevContas => {
      const { updatedContas, changed } = checkAndUpdateStatus(prevContas);
      return changed ? updatedContas : prevContas;
    });
  }, []); // Run only once on mount

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
    clients,
    setClients,
    produtosServicos,
    setProdutosServicos,
    fornecedores,
    setFornecedores,
  };
};
