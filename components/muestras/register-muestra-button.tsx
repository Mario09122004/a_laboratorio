"use client";

import { useState, useMemo, useEffect } from "react"; // 1. Importar useEffect
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { PlusCircle } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Id } from "@/convex/_generated/dataModel";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { hasPermission } from "@/lib/utils";

const formSchema = z.object({
  clienteId: z.string().min(1, { message: "Debe seleccionar un cliente." }),
  analisisId: z.string().min(1, { message: "Debe seleccionar un tipo de análisis." }),
  estado: z.string().min(1, { message: "Debe seleccionar un estado inicial." }),
});

export function RegisterMestraButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [clienteSearch, setClienteSearch] = useState("");
  const [analisisSearch, setAnalisisSearch] = useState("");
  
  // 2. Añadir el estado 'isClient'
  const [isClient, setIsClient] = useState(false);
  
  const clientes = useQuery(api.clientes.getClientes);
  const analisis = useQuery(api.analisis.getAnalisis);
  const estados = useQuery(api.estadosMuestra.getEstadosMuestra);

  const createMuestra = useMutation(api.muestras.createMuestra);

  // 3. Añadir el useEffect para actualizar 'isClient' solo en el navegador
  useEffect(() => {
    setIsClient(true);
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { clienteId: "", analisisId: "", estado: "" },
  });

  const filteredClientes = useMemo(() => {
    if (!clientes) return [];
    return clientes.filter(c => c.nombreCompleto.toLowerCase().includes(clienteSearch.toLowerCase()));
  }, [clientes, clienteSearch]);

  const filteredAnalisis = useMemo(() => {
    if (!analisis) return [];
    return analisis.filter(a => a.nombre.toLowerCase().includes(analisisSearch.toLowerCase()));
  }, [analisis, analisisSearch]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const analisisSeleccionado = analisis?.find(a => a._id === values.analisisId);
    if (!analisisSeleccionado) {
      toast.error("Análisis no encontrado. Intente de nuevo.");
      return;
    }

    try {
      await createMuestra({
        clienteId: values.clienteId as Id<"Cliente">,
        analisisId: values.analisisId as Id<"Analisis">,
        estado: values.estado as Id<"EstadosMuestra">,
        analisisNombre: analisisSeleccionado.nombre,
      });
      toast.success("Muestra registrada con éxito.");
      form.reset();
      setClienteSearch("");
      setAnalisisSearch("");
      setIsOpen(false);
    } catch (error: unknown) {
        if (error instanceof Error) {
            toast.error(`Error al registrar: ${error.message}`);
        } else {
            toast.error("Ocurrió un error desconocido al registrar.");
        }
    }
  };
  
  const isLoadingData = !clientes || !analisis || !estados;

  //Consultar permisos
  const puedeRegistrar = hasPermission("RegistrarMuestra");

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>

        {/* 4. Modificar la condición para incluir 'isClient' */}
        { isClient && puedeRegistrar && (
          <Button><PlusCircle className="h-4 w-4 mr-2" />Registrar Muestra</Button>
        )}

      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>Registrar Nueva Muestra</DialogTitle></DialogHeader>
        {isLoadingData ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="clienteId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Seleccione un cliente" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <div className="p-2">
                            <Input
                                placeholder="Buscar cliente..."
                                value={clienteSearch}
                                onChange={(e) => setClienteSearch(e.target.value)}
                                onKeyDown={(e) => e.stopPropagation()}
                            />
                        </div>
                        {filteredClientes.map(c => <SelectItem key={c._id} value={c._id}>{c.nombreCompleto}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="analisisId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Análisis</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Seleccione un análisis" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <div className="p-2">
                            <Input
                                placeholder="Buscar análisis..."
                                value={analisisSearch}
                                onChange={(e) => setAnalisisSearch(e.target.value)}
                                onKeyDown={(e) => e.stopPropagation()}
                            />
                        </div>
                        {filteredAnalisis.map(a => <SelectItem key={a._id} value={a._id}>{a.nombre}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="estado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado Inicial</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Seleccione un estado" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {estados?.map(e => <SelectItem key={e._id} value={e._id}>{e.estado}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Guardando..." : "Guardar Muestra"}</Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}