
import React from 'react';
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus } from "lucide-react";
import { Vendedor } from "./types";
import { Client } from "../crm/types";
import { ClientForm } from "../crm/ClientForm";

interface PropostaFormHeaderProps {
    formData: {
        titulo: string;
        cliente: string;
        vendedor: string;
        dataValidade: string;
    };
    setFormData: (data: any) => void;
    vendedores: Vendedor[];
    clients: Client[];
    showClientDialog: boolean;
    setShowClientDialog: (show: boolean) => void;
    handleClientSave: (client: Client) => void;
}

export function PropostaFormHeader({
    formData,
    setFormData,
    vendedores,
    clients,
    showClientDialog,
    setShowClientDialog,
    handleClientSave
}: PropostaFormHeaderProps) {
    return (
        <>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="titulo">Título da Proposta *</Label>
                    <Input id="titulo" value={formData.titulo} onChange={(e) => setFormData({ ...formData, titulo: e.target.value })} placeholder="Ex: Proposta para Projeto X" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="cliente">Cliente *</Label>
                    <div className="flex items-center gap-2">
                        <Select value={formData.cliente} onValueChange={(value) => setFormData({ ...formData, cliente: value })} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione um cliente" />
                            </SelectTrigger>
                            <SelectContent>
                                {clients.map(client => (
                                    <SelectItem key={client.id} value={client.razaoSocial}>
                                        {client.razaoSocial}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Dialog open={showClientDialog} onOpenChange={setShowClientDialog}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="icon" type="button">
                                    <UserPlus className="h-4 w-4" />
                                </Button>
                            </DialogTrigger>
                            <ClientForm
                                open={showClientDialog}
                                onClose={() => setShowClientDialog(false)}
                                onSave={(client) => {
                                    handleClientSave(client);
                                    setShowClientDialog(false);
                                }}
                            />
                        </Dialog>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Vendedor Responsável *</Label>
                    <Select value={formData.vendedor} onValueChange={(value) => setFormData({ ...formData, vendedor: value })}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione o vendedor" />
                        </SelectTrigger>
                        <SelectContent>
                            {vendedores.map(vendedor => (
                                <SelectItem key={vendedor.id} value={vendedor.nome}>
                                    {vendedor.nome}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="dataValidade">Validade da Proposta</Label>
                    <Input id="dataValidade" type="date" value={formData.dataValidade} onChange={(e) => setFormData({ ...formData, dataValidade: e.target.value })} />
                </div>
            </div>
        </>
    );
}
