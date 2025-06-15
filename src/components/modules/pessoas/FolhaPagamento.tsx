
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Holerite, Funcionario } from "./types";
import { FileText, Calculator } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FolhaPagamentoProps {
    holerites: Holerite[];
    setHolerites: React.Dispatch<React.SetStateAction<Holerite[]>>;
    funcionarios: Funcionario[];
}

const statusVariant: Record<Holerite['status'], "default" | "secondary" | "outline"> = {
    pago: 'default',
    calculado: 'secondary',
    pendente: 'outline',
};

const FolhaPagamento = ({ holerites, setHolerites, funcionarios }: FolhaPagamentoProps) => {
    const [selectedCompetencia, setSelectedCompetencia] = useState<string>(() => {
        const date = new Date();
        return format(date, 'MM/yyyy');
    });

    const competencias = useMemo(() => {
        const comps = new Set(holerites.map(h => h.competencia));
        const currentComp = format(new Date(), 'MM/yyyy');
        if (!comps.has(currentComp)) {
            comps.add(currentComp);
        }
        return Array.from(comps).sort((a, b) => {
            const [aMonth, aYear] = a.split('/');
            const [bMonth, bYear] = b.split('/');
            return new Date(`${bYear}-${bMonth}-01`).getTime() - new Date(`${aYear}-${aMonth}-01`).getTime();
        });
    }, [holerites]);

    const getFuncionario = (id: string) => funcionarios.find(f => f.id === id);

    const holeritesParaTabela = useMemo(() => {
        const holeritesDoMes = holerites.filter(h => h.competencia === selectedCompetencia);
        const holeritesExistentesIds = new Set(holeritesDoMes.map(h => h.funcionarioId));
        
        const funcionariosSemHolerite = funcionarios
            .filter(f => f.status === 'ativo' && !holeritesExistentesIds.has(f.id));

        const novosHoleritesPendentes: Holerite[] = funcionariosSemHolerite.map(f => ({
            id: `temp-${f.id}-${selectedCompetencia}`,
            funcionarioId: f.id,
            competencia: selectedCompetencia,
            salarioBase: f.salario,
            totalProventos: 0,
            totalDescontos: 0,
            liquidoAPagar: 0,
            proventos: [],
            descontos: [],
            status: 'pendente'
        }));

        return [...holeritesDoMes, ...novosHoleritesPendentes].sort((a, b) => {
            const nomeA = getFuncionario(a.funcionarioId)?.nome || '';
            const nomeB = getFuncionario(b.funcionarioId)?.nome || '';
            return nomeA.localeCompare(nomeB);
        });

    }, [holerites, funcionarios, selectedCompetencia]);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Folha de Pagamento</CardTitle>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Competência:</span>
                    <Select value={selectedCompetencia} onValueChange={setSelectedCompetencia}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Selecione o mês" />
                        </SelectTrigger>
                        <SelectContent>
                            {competencias.map(comp => (
                                <SelectItem key={comp} value={comp}>
                                    {format(new Date(parseInt(comp.split('/')[1]), parseInt(comp.split('/')[0]) - 1), "MMMM 'de' yyyy", { locale: ptBR })}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Colaborador</TableHead>
                            <TableHead>Salário Base</TableHead>
                            <TableHead>Proventos</TableHead>
                            <TableHead>Descontos</TableHead>
                            <TableHead>Líquido a Pagar</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {holeritesParaTabela.map(holerite => {
                            const funcionario = getFuncionario(holerite.funcionarioId);
                            if (!funcionario) return null;
                            return (
                                <TableRow key={holerite.id}>
                                    <TableCell className="font-medium">{funcionario.nome}</TableCell>
                                    <TableCell>{funcionario.salario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                                    <TableCell className="text-green-600">{holerite.totalProventos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                                    <TableCell className="text-red-600">{holerite.totalDescontos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                                    <TableCell className="font-bold">{holerite.liquidoAPagar.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={statusVariant[holerite.status]}>{holerite.status.charAt(0).toUpperCase() + holerite.status.slice(1)}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {holerite.status === 'pendente' && (
                                            <Button variant="outline" size="sm">
                                                <Calculator className="mr-2 h-4 w-4" />
                                                Calcular
                                            </Button>
                                        )}
                                        {holerite.status !== 'pendente' && (
                                            <Button variant="ghost" size="icon">
                                                <FileText className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

export default FolhaPagamento;
