
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { z } from "zod";

import { ContaPagar } from "./contas-pagar/types";
import { formSchema } from "./contas-pagar/config";
import { ContasPagarSummary } from "./contas-pagar/ContasPagarSummary";
import { ContasPagarFilters } from "./contas-pagar/ContasPagarFilters";
import { ContasPagarTable } from "./contas-pagar/ContasPagarTable";
import { NovaContaDialog } from "./contas-pagar/NovaContaDialog";
import { RegistrarPagamentoDialog } from "./contas-pagar/RegistrarPagamentoDialog";

export function ContasPagar() {
  const { toast } = useToast();
  const [contas, setContas] = useState<ContaPagar[]>([
    {
      id: "1",
      descricao: "Aluguel do Escritório",
      valor: 2500.00,
      dataVencimento: new Date(2025, 5, 15),
      status: "atrasado",
      fornecedor: "Imobiliária Silva",
      categoria: "Despesas Fixas",
      numeroDocumento: "BOL-001",
      competencia: "06/2025"
    },
    {
      id: "2", 
      descricao: "Fornecedor ABC - Material",
      valor: 1200.00,
      dataVencimento: new Date(2025, 5, 16),
      status: "pendente",
      fornecedor: "ABC Materiais",
      categoria: "Custos de Mercadoria",
      numeroDocumento: "NF-12345",
      competencia: "06/2025"
    },
    {
      id: "3",
      descricao: "Conta de Luz",
      valor: 450.75,
      dataVencimento: new Date(2025, 5, 20),
      status: "pago",
      fornecedor: "Eletropaulo",
      categoria: "Despesas Operacionais",
      numeroDocumento: "FAT-789",
      dataPagamento: new Date(2025, 5, 18),
      formaPagamento: "PIX",
      competencia: "05/2025"
    }
  ]);

  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");
  const [filtroCompetencia, setFiltroCompetencia] = useState<string>("");
  const [busca, setBusca] = useState("");
  const [showNovaContaDialog, setShowNovaContaDialog] = useState(false);
  const [pagamentoDialogState, setPagamentoDialogState] = useState<{ open: boolean; contaId: string | null }>({ open: false, contaId: null });

  const contasFiltradas = contas.filter(conta => {
    const matchStatus = filtroStatus === "todos" || conta.status === filtroStatus;
    const matchCategoria = filtroCategoria === "todas" || conta.categoria === filtroCategoria;
    const matchBusca = busca === "" || 
      conta.descricao.toLowerCase().includes(busca.toLowerCase()) ||
      conta.fornecedor.toLowerCase().includes(busca.toLowerCase());
    const matchCompetencia = !filtroCompetencia || (conta.competencia && conta.competencia.includes(filtroCompetencia));
    
    return matchStatus && matchCategoria && matchBusca && matchCompetencia;
  });

  function onSubmitNovaConta(values: z.infer<typeof formSchema>) {
    if (values.recorrente && values.frequencia && values.numParcelas) {
        const novasContas: ContaPagar[] = [];
        const idGrupo = Date.now().toString();
        const dataVencimentoBase = new Date(values.dataVencimento);

        const getIncrementoMeses = (frequencia: typeof values.frequencia) => {
            switch(frequencia) {
                case 'mensal': return 1;
                case 'bimestral': return 2;
                case 'trimestral': return 3;
                case 'semestral': return 6;
                case 'anual': return 12;
                default: return 0;
            }
        };

        const incremento = getIncrementoMeses(values.frequencia);

        for (let i = 0; i < values.numParcelas; i++) {
            const vencimento = new Date(dataVencimentoBase);
            vencimento.setMonth(vencimento.getMonth() + (i * incremento));
            
            const parcelaNum = i + 1;
            const novaConta: ContaPagar = {
                id: `${idGrupo}-${parcelaNum}`,
                descricao: `${values.descricao} (${parcelaNum}/${values.numParcelas})`,
                valor: values.valor,
                dataVencimento: vencimento,
                status: 'pendente',
                fornecedor: values.fornecedor,
                categoria: values.categoria,
                numeroDocumento: values.numeroDocumento,
                competencia: format(vencimento, 'MM/yyyy'),
                recorrente: true,
                frequencia: values.frequencia,
                numParcelas: values.numParcelas,
                parcelaAtual: parcelaNum,
                idGrupoRecorrencia: idGrupo,
            };
            novasContas.push(novaConta);
        }
        setContas(prev => [...prev, ...novasContas]);
        toast({ title: "Contas recorrentes criadas!", description: `${values.numParcelas} contas foram adicionadas.` });
    } else {
        const novaConta: ContaPagar = {
            id: Date.now().toString(),
            descricao: values.descricao,
            valor: values.valor,
            dataVencimento: values.dataVencimento,
            status: 'pendente',
            fornecedor: values.fornecedor,
            categoria: values.categoria,
            numeroDocumento: values.numeroDocumento,
            competencia: values.competencia || format(values.dataVencimento, 'MM/yyyy'),
        };
        setContas(prev => [...prev, novaConta]);
        toast({ title: "Conta criada com sucesso!" });
    }
    setShowNovaContaDialog(false);
  }

  const handleRegistrarPagamento = (dataPagamento: Date) => {
    if (!pagamentoDialogState.contaId) return;

    setContas(contas.map(c =>
      c.id === pagamentoDialogState.contaId
        ? { ...c, status: 'pago', dataPagamento: dataPagamento }
        : c
    ));

    setPagamentoDialogState({ open: false, contaId: null });

    toast({
      title: "Pagamento Registrado!",
      description: "A conta foi marcada como paga com sucesso.",
    });
  };

  const handleAbrirDialogPagamento = (contaId: string) => {
    setPagamentoDialogState({ open: true, contaId });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Contas a Pagar</h2>
          <p className="text-muted-foreground">
            Gerencie suas obrigações financeiras e evite atrasos
          </p>
        </div>
        <NovaContaDialog 
            open={showNovaContaDialog} 
            onOpenChange={setShowNovaContaDialog} 
            onSubmit={onSubmitNovaConta} 
        />
      </div>

      <ContasPagarSummary contas={contas} />

      <ContasPagarFilters
        busca={busca} setBusca={setBusca}
        filtroCompetencia={filtroCompetencia} setFiltroCompetencia={setFiltroCompetencia}
        filtroStatus={filtroStatus} setFiltroStatus={setFiltroStatus}
        filtroCategoria={filtroCategoria} setFiltroCategoria={setFiltroCategoria}
      />
      
      <ContasPagarTable
        contas={contasFiltradas}
        onAbrirDialogPagamento={handleAbrirDialogPagamento}
      />

      <RegistrarPagamentoDialog
        open={pagamentoDialogState.open}
        onOpenChange={(open) => setPagamentoDialogState({ ...pagamentoDialogState, open })}
        onConfirm={handleRegistrarPagamento}
      />
    </div>
  );
}
