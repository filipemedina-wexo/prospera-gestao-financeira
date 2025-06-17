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
import { format } from "date-fns";

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

  useEffect(() => {
    setContasAPagar(currentContas => {
        const syncedContasFromFornecedores = new Map<string, ContaPagar>();

        for (const f of fornecedores) {
            if (f.proximoPagamento && f.valorProximoPagamento) {
                const contaId = `fornecedor-sync-${f.id}`;
                syncedContasFromFornecedores.set(contaId, {
                    id: contaId,
                    descricao: `Pagamento Agendado: ${f.razaoSocial}`,
                    valor: f.valorProximoPagamento,
                    dataVencimento: new Date(f.proximoPagamento),
                    status: 'pendente',
                    fornecedor: f.razaoSocial,
                    categoria: 'Fornecedor',
                    competencia: format(new Date(f.proximoPagamento), 'MM/yyyy'),
                });
            }
        }

        const newContasAPagar: ContaPagar[] = [];
        const manualContas = currentContas.filter(c => !c.id.startsWith('fornecedor-sync-'));
        newContasAPagar.push(...manualContas);
        
        const existingSyncedContas = currentContas.filter(c => c.id.startsWith('fornecedor-sync-'));
        for(const existing of existingSyncedContas) {
            const updated = syncedContasFromFornecedores.get(existing.id);

            if (updated) {
                if (existing.status === 'pago') {
                    newContasAPagar.push(existing);
                } else {
                    newContasAPagar.push(updated);
                }
                syncedContasFromFornecedores.delete(existing.id);
            } else {
                if (existing.status === 'pago') {
                    newContasAPagar.push(existing);
                }
            }
        }
        
        newContasAPagar.push(...Array.from(syncedContasFromFornecedores.values()));

        // Check if there are actual changes before returning a new array
        if (currentContas.length === newContasAPagar.length) {
            const currentIds = new Set(currentContas.map(c => c.id));
            let same = true;
            for(const newConta of newContasAPagar) {
                if(!currentIds.has(newConta.id)) {
                    same = false;
                    break;
                }
                const oldConta = currentContas.find(c => c.id === newConta.id);
                if(JSON.stringify(oldConta) !== JSON.stringify(newConta)){
                    same = false;
                    break;
                }
            }
            if(same) return currentContas;
        }

        return newContasAPagar;
    });
  }, [fornecedores, setContasAPagar]);

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