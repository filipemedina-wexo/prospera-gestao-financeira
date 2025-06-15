
import { useState, useMemo } from 'react';
import { Client } from './types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format, getMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

interface SegmentationProps {
  clients: Client[];
}

export const Segmentation = ({ clients }: SegmentationProps) => {
  const [statusFilter, setStatusFilter] = useState('todos');
  const [birthdayMonthFilter, setBirthdayMonthFilter] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');

  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => ({
    value: i.toString(),
    label: format(new Date(2000, i, 1), 'MMMM', { locale: ptBR })
  })), []);

  const filteredClients = useMemo(() => clients.filter(client => {
    const statusMatch = statusFilter === 'todos' || client.status.toLowerCase() === statusFilter;
    
    const birthdayMatch = birthdayMonthFilter === 'todos' || (client.dataAniversario && getMonth(client.dataAniversario) === parseInt(birthdayMonthFilter));

    const searchMatch = searchTerm === '' || 
      client.nomeFantasia.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()));

    return statusMatch && birthdayMatch && searchMatch;
  }), [clients, statusFilter, birthdayMonthFilter, searchTerm]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Segmentação de Clientes</CardTitle>
          <CardDescription>Filtre sua base de clientes para encontrar informações específicas.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4">
          <Input 
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="inativo">Inativo</SelectItem>
            </SelectContent>
          </Select>
          <Select value={birthdayMonthFilter} onValueChange={setBirthdayMonthFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Mês de aniversário" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Qualquer mês</SelectItem>
              {months.map(month => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label.charAt(0).toUpperCase() + month.label.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Resultados ({filteredClients.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aniversário</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length > 0 ? (
                  filteredClients.map(client => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.nomeFantasia}</TableCell>
                      <TableCell className="hidden md:table-cell">{client.email || 'N/A'}</TableCell>
                      <TableCell><Badge variant={client.status === 'Ativo' ? 'default' : 'secondary'}>{client.status}</Badge></TableCell>
                      <TableCell>
                        {client.dataAniversario ? format(client.dataAniversario, 'dd/MM/yyyy') : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">Nenhum cliente encontrado com os filtros aplicados.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
