"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { FilePenLine, Trash2, FileSearch, StickyNote } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { NotasManager } from "./../notas/notas-manager";
import { hasPermission } from "@/lib/utils";

type MuestraConDetalles = Doc<"Muestras"> & { clienteNombre: string; estadoNombre: string; estadoColor: string; analisisNombre: string; };

const formSchema = z.object({
  estado: z.string().min(1),
  resultados: z.array(z.object({
      nombre: z.string(),
      medicion: z.string(),
      estandar: z.string(),
      valor: z.string().nullable().optional(),
  })),
});

interface MuestraActionsProps {
  muestra: MuestraConDetalles;
}

export function MuestraActions({ muestra }: MuestraActionsProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const estados = useQuery(api.estadosMuestra.getEstadosMuestra);

  const updateMuestra = useMutation(api.muestras.updateMuestra);
  const deleteMuestra = useMutation(api.muestras.deleteMuestra);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      estado: muestra.estado,
      resultados: muestra.resultados.map(r => ({ ...r, valor: r.valor ?? '' })),
    },
  });

  const { fields } = useFieldArray({ control: form.control, name: "resultados" });

  const onUpdateSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await updateMuestra({
        id: muestra._id,
        estado: values.estado as Id<"EstadosMuestra">,
        resultados: values.resultados.map(r => ({ ...r, valor: r.valor === '' ? null : r.valor })),
      });
      toast.success("Muestra actualizada.");
      setIsEditDialogOpen(false);
    } catch (error: unknown) {
        toast.error("Error al actualizar la muestra.");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMuestra({ id: muestra._id });
      toast.success("Muestra eliminada.");
    } catch (error: unknown) {
      toast.error("Error al eliminar la muestra.");
    }
  };

  const handleEditClick = () => {
    form.reset({
      estado: muestra.estado,
      resultados: muestra.resultados.map(r => ({ ...r, valor: r.valor ?? '' })),
    });
    setIsEditDialogOpen(true);
  };

  const puedeEliminar = hasPermission("EliminarMuestra");
  const puedeEditar = hasPermission("EditarMuestra");
  const puedeVerDetalles = hasPermission("VerDetallesMuestra");
  const puedeVerNotas = hasPermission("VerNotasMuestras");

  return (
    <>
      {puedeVerDetalles && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader><DialogTitle>Detalles de la Muestra</DialogTitle><DialogDescription>Información completa de la muestra registrada para {muestra.clienteNombre}.</DialogDescription></DialogHeader>
            <div className="grid gap-4 py-4"><div className="grid grid-cols-2 gap-4"><div><h4 className="text-sm font-semibold text-muted-foreground">Cliente</h4><p>{muestra.clienteNombre}</p></div><div><h4 className="text-sm font-semibold text-muted-foreground">Tipo de Análisis</h4><p>{muestra.analisisNombre}</p></div><div><h4 className="text-sm font-semibold text-muted-foreground">Estado Actual</h4><Badge style={{ backgroundColor: muestra.estadoColor, color: '#fff' }}>{muestra.estadoNombre}</Badge></div><div><h4 className="text-sm font-semibold text-muted-foreground">Fecha de Registro</h4><p>{new Date(muestra.fechaRegistro).toLocaleString()}</p></div></div><div><h4 className="text-sm font-semibold text-muted-foreground mt-4 mb-2">Resultados del Análisis</h4><div className="rounded-md border"><Table><TableHeader><TableRow><TableHead>Parámetro</TableHead><TableHead>Valor Obtenido</TableHead><TableHead className="text-right">Valor de Referencia</TableHead></TableRow></TableHeader><TableBody>{muestra.resultados.map((resultado, index) => (<TableRow key={index}><TableCell className="font-medium">{resultado.nombre}</TableCell><TableCell>{resultado.valor ?? <span className="text-muted-foreground">Pendiente</span>}</TableCell><TableCell className="text-right">{resultado.estandar}</TableCell></TableRow>))}</TableBody></Table></div></div></div>
            <DialogFooter><Button onClick={() => setIsDetailsOpen(false)}>Cerrar</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {puedeEditar && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Editar Muestra de {muestra.clienteNombre}</DialogTitle></DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onUpdateSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2"><FormLabel>Cliente</FormLabel><Input value={muestra.clienteNombre} disabled /></div>
                  <FormField control={form.control} name="estado" render={({ field }) => {
                      const selectedEstado = estados?.find(e => e._id === field.value);
                      return (<FormItem><FormLabel>Estado</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger ref={field.ref} style={{ backgroundColor: selectedEstado?.color, borderColor: selectedEstado?.color }} className={selectedEstado ? 'text-white' : ''}><SelectValue placeholder="Seleccione un estado" /></SelectTrigger><SelectContent>{estados?.map(e => (<SelectItem key={e._id} value={e._id}><div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full border" style={{ backgroundColor: e.color }} /><span>{e.estado}</span></div></SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>);
                  }}/>
                </div>
                <div>
                  <FormLabel>Resultados</FormLabel>
                  <div className="space-y-2 mt-2">
                    {fields.map((field, index) => (
                      <div key={field.id} className="grid grid-cols-4 gap-2 items-center border p-2 rounded-md">
                        <div className="col-span-3 space-y-1"><p className="font-semibold text-sm">{field.nombre}</p><p className="text-xs text-muted-foreground">{field.medicion} | Ref: {field.estandar}</p></div>
                        <FormField control={form.control} name={`resultados.${index}.valor`} render={({ field }) => ( <FormItem><FormControl><Input placeholder="Valor..." {...field} /></FormControl><FormMessage /></FormItem> )}/>
                      </div>
                    ))}
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="secondary" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Guardando..." : "Guardar Cambios"}</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}
      
      {puedeEliminar && (
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>¿Estás seguro?</AlertDialogTitle><AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
      )}
      
      <Sheet>
        <TooltipProvider delayDuration={100}>
          <div className="flex items-center justify-end gap-1">
            {puedeVerNotas && (
              <Tooltip>
                <TooltipTrigger asChild><SheetTrigger asChild><Button variant="ghost" size="icon"><StickyNote className="h-4 w-4" /><span className="sr-only">Gestionar Notas</span></Button></SheetTrigger></TooltipTrigger>
                <TooltipContent><p>Gestionar Notas</p></TooltipContent>
              </Tooltip>
            )}
            {puedeVerDetalles && (
              <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => setIsDetailsOpen(true)}><FileSearch className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent><p>Ver Detalles</p></TooltipContent></Tooltip>
            )}
            {puedeEditar && (
              <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={handleEditClick}><FilePenLine className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent><p>Editar Muestra</p></TooltipContent></Tooltip>
            )}
            {puedeEliminar && (
              <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => setIsDeleteDialogOpen(true)} className="text-red-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent><p>Eliminar Muestra</p></TooltipContent></Tooltip>
            )}
          </div>
        </TooltipProvider>
        {puedeVerNotas && (
          <SheetContent>
            <SheetHeader><SheetTitle>Notas para: {muestra.clienteNombre}</SheetTitle></SheetHeader>
            <NotasManager muestraId={muestra._id} />
          </SheetContent>
        )}
      </Sheet>
    </>
  );
}