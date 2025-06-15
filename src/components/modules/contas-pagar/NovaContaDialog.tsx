
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon, Plus } from "lucide-react";
import { formSchema, categorias, opcoesFrequencia, currencyFormatter } from "./config";

type FormValues = z.infer<typeof formSchema>;

interface NovaContaDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: FormValues) => void;
}

export function NovaContaDialog({ open, onOpenChange, onSubmit }: NovaContaDialogProps) {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            descricao: "",
            valor: undefined,
            dataVencimento: undefined,
            fornecedor: "",
            categoria: "",
            numeroDocumento: "",
            observacoes: "",
            competencia: "",
            recorrente: false,
        },
    });

    const isRecorrente = form.watch("recorrente");

    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            form.reset();
        }
        onOpenChange(isOpen);
    };

    const handleFormSubmit = (values: FormValues) => {
        onSubmit(values);
        form.reset();
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Conta a Pagar
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Nova Conta a Pagar</DialogTitle>
                    <DialogDescription>
                        Cadastre uma nova obrigação financeira da sua empresa
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="descricao" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descrição da Despesa *</FormLabel>
                                    <FormControl><Input placeholder="Ex: Aluguel do escritório" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="valor" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Valor *</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="text"
                                            placeholder="R$ 0,00"
                                            value={field.value !== undefined ? currencyFormatter.format(field.value) : ''}
                                            onChange={(e) => {
                                                const rawValue = e.target.value.replace(/\D/g, '');
                                                if (!rawValue) {
                                                    field.onChange(undefined);
                                                    return;
                                                }
                                                const numberValue = parseInt(rawValue, 10) / 100;
                                                field.onChange(numberValue);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <FormField control={form.control} name="dataVencimento" render={({ field }) => (
                                <FormItem className="flex flex-col pt-2">
                                    <FormLabel>Data de Vencimento *</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button variant="outline" className={cn("justify-start text-left font-normal w-full", !field.value && "text-muted-foreground")}>
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {field.value ? format(field.value, "dd/MM/yyyy") : "Selecione a data"}
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="competencia" render={({ field }) => (
                                <FormItem className="pt-2">
                                    <FormLabel>Competência (Opcional)</FormLabel>
                                    <FormControl>
                                    <Input
                                        placeholder="MM/AAAA"
                                        maxLength={7}
                                        {...field}
                                        onChange={(e) => {
                                            let value = e.target.value.replace(/\D/g, '');
                                            if (value.length > 2) {
                                                value = `${value.slice(0, 2)}/${value.slice(2, 6)}`;
                                            }
                                            field.onChange(value);
                                        }}
                                    />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="fornecedor" render={({ field }) => (
                                <FormItem className="pt-2">
                                    <FormLabel>Fornecedor/Credor *</FormLabel>
                                    <FormControl><Input placeholder="Nome da empresa ou pessoa" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="categoria" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Categoria *</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Selecione a categoria" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {categorias.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="numeroDocumento" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Número do Documento</FormLabel>
                                    <FormControl><Input placeholder="NF, Boleto, etc." {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                        
                        <div className="space-y-2 pt-4">
                            <div className="rounded-lg border p-4 shadow-sm">
                            <FormField
                                control={form.control}
                                name="recorrente"
                                render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between">
                                    <div className="space-y-0.5">
                                    <FormLabel>Conta Recorrente?</FormLabel>
                                    <FormDescription>
                                        Marque se esta conta se repete por vários meses.
                                    </FormDescription>
                                    </div>
                                    <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                    </FormControl>
                                </FormItem>
                                )}
                            />
                            <Collapsible open={isRecorrente} className="w-full">
                                <CollapsibleContent>
                                <div className="grid grid-cols-2 gap-4 pt-4 mt-4 border-t">
                                    <FormField
                                    control={form.control}
                                    name="frequencia"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Frequência *</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione..." />
                                            </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                            {opcoesFrequencia.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                                </SelectItem>
                                            ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                    />
                                    <FormField
                                    control={form.control}
                                    name="numParcelas"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Nº de Parcelas *</FormLabel>
                                        <FormControl>
                                            <Input
                                            type="number"
                                            placeholder="Ex: 12"
                                            {...field}
                                            onChange={(e) => field.onChange(e.target.value)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                    />
                                </div>
                                </CollapsibleContent>
                            </Collapsible>
                            </div>
                        </div>

                        <FormField control={form.control} name="observacoes" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Observações</FormLabel>
                                <FormControl><Textarea placeholder="Informações adicionais..." rows={3} {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        
                        <div className="flex justify-end space-x-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit">
                                Cadastrar Conta
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
