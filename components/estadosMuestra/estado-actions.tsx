"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { FilePenLine, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { hasPermission } from "@/lib/utils";

const formSchema = z.object({
  estado: z.string().min(1, { message: "El nombre del estado es requerido." }),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, { message: "Debe ser un color hexadecimal válido." }),
});

interface EstadoActionsProps {
  estado: Doc<"EstadosMuestra">;
}

export function EstadoActions({ estado }: EstadoActionsProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isClient, setIsClient] = useState(false); 

  const updateEstado = useMutation(api.estadosMuestra.updateEstadoMuestra);
  const deleteEstado = useMutation(api.estadosMuestra.deleteEstadoMuestra);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      estado: estado.estado,
      color: estado.color,
    },
  });

  const onUpdateSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await updateEstado({ id: estado._id, ...values });
      toast.success("Estado actualizado.");
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar el estado.");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteEstado({ id: estado._id });
      toast.success("Estado eliminado.");
    } catch (error) {
      console.error(error);
      toast.error("Error al eliminar el estado.");
    }
  };

  const handleEditClick = () => {
    form.reset({ estado: estado.estado, color: estado.color });
    setIsEditDialogOpen(true);
  };

  const puedeEditarEstados = hasPermission("EditarEstados");
  const puedeEliminarEstados = hasPermission("EliminarEstados");

  return (
    <>
      {isClient && puedeEditarEstados && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Estado</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onUpdateSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="estado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Estado</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          className="p-1 h-10 w-14"
                          value={field.value}
                          onChange={field.onChange}
                        />
                        <FormControl>
                          <Input placeholder="#FFFFFF" {...field} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="secondary" onClick={() => setIsEditDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}

      {isClient && puedeEliminarEstados && (
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      
      <TooltipProvider delayDuration={100}>
        <div className="flex items-center justify-end gap-2">
          
          {isClient && puedeEditarEstados && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleEditClick}>
                  <FilePenLine className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Editar Estado</p>
              </TooltipContent>
            </Tooltip>
          )}

          {isClient && puedeEliminarEstados && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => setIsDeleteDialogOpen(true)} className="text-red-500 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Eliminar Estado</p>
              </TooltipContent>
            </Tooltip>
          )}

        </div>
      </TooltipProvider>
    </>
  );
}