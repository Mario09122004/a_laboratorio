"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { FilePenLine, Trash, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { hasPermission } from "@/lib/utils";

const tiposDeAnalisis = ["Hematología clínica", "Perfil de rutina", "Química clínica", "Coprología", "Serología", "Uroanálisis", "Hormonales"] as const;

const formSchema = z.object({
  nombre: z.string().min(1, { message: "El nombre es requerido." }),
  descripcion: z.string().optional(),
  Tipo: z.enum(tiposDeAnalisis, { message: "Debe seleccionar un tipo." }),
  Campos: z.array(z.object({
      nombre: z.string().min(1, { message: "Requerido" }),
      medicion: z.string().min(1, { message: "Requerido" }),
      valorReferencia: z.string().min(1, { message: "Requerido" }),
  })).min(1, { message: "Debe haber al menos un campo." }),
});

interface AnalisisActionsProps {
  analisis: Doc<"Analisis">;
}

export function AnalisisActions({ analisis }: AnalisisActionsProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isClient, setIsClient] = useState(false); 

  const updateAnalisis = useMutation(api.analisis.updateAnalisis);
  const deleteAnalisis = useMutation(api.analisis.deleteAnalisis);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: analisis.nombre,
      descripcion: analisis.descripcion ?? "",
      Tipo: analisis.Tipo,
      Campos: analisis.Campos ?? [], 
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "Campos" });

  const onUpdateSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await updateAnalisis({ id: analisis._id, ...values });
      toast.success("Análisis actualizado.");
      setIsEditDialogOpen(false);
    } catch (error) {
      toast.error("Error al actualizar el análisis.");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAnalisis({ id: analisis._id });
      toast.success("Análisis eliminado.");
    } catch (error) {
      toast.error("Error al eliminar el análisis.");
    }
  };

  const handleEditClick = () => {
    form.reset({
      nombre: analisis.nombre,
      descripcion: analisis.descripcion ?? "",
      Tipo: analisis.Tipo,
      Campos: analisis.Campos ?? [],
    });
    setIsEditDialogOpen(true);
  };

  const puedeEliminarAnalisis = hasPermission("EliminarAnalisis");
  const puedeEditarAnalisis = hasPermission("EditarAnalisis");

  return (
    <>
      {isClient && puedeEditarAnalisis && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Editar Análisis</DialogTitle></DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onUpdateSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="nombre" render={({ field }) => ( <FormItem> <FormLabel>Nombre del Análisis</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                      <FormField control={form.control} name="Tipo" render={({ field }) => ( <FormItem> <FormLabel>Tipo</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl> <SelectContent> {tiposDeAnalisis.map(tipo => <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>)} </SelectContent> </Select> <FormMessage /> </FormItem> )}/>
                  </div>
                  <FormField control={form.control} name="descripcion" render={({ field }) => ( <FormItem> <FormLabel>Descripción (Opcional)</FormLabel> <FormControl><Textarea {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                  <div>
                      <FormLabel>Campos del Análisis</FormLabel>
                      {fields.map((field, index) => (
                          <div key={field.id} className="grid grid-cols-1 md:grid-cols-7 gap-2 items-end border p-2 rounded-md mt-2">
                          <FormField control={form.control} name={`Campos.${index}.nombre`} render={({ field }) => ( <FormItem className="col-span-2"> <FormLabel className="text-xs">Nombre</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                          <FormField control={form.control} name={`Campos.${index}.medicion`} render={({ field }) => ( <FormItem className="col-span-2"> <FormLabel className="text-xs">Medición</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                          <FormField control={form.control} name={`Campos.${index}.valorReferencia`} render={({ field }) => ( <FormItem className="col-span-2"> <FormLabel className="text-xs">Valor Referencia</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                          <Button type="button" variant="outline" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}><Trash className="h-4 w-4" /></Button>
                          </div>
                      ))}
                      <FormMessage>{form.formState.errors.Campos?.message}</FormMessage>
                      <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ nombre: "", medicion: "", valorReferencia: "" })}>Añadir Campo</Button>
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
      
      {isClient && puedeEliminarAnalisis && (
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <TooltipProvider delayDuration={100}>
        <div className="flex items-center justify-end gap-2">
          
          {isClient && puedeEditarAnalisis && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleEditClick}>
                  <FilePenLine className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Editar Análisis</p></TooltipContent>
            </Tooltip>
          )}

          {isClient && puedeEliminarAnalisis && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => setIsDeleteDialogOpen(true)} className="text-red-500 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Eliminar Análisis</p></TooltipContent>
            </Tooltip>
          )}

        </div>
      </TooltipProvider>
    </>
  );
}