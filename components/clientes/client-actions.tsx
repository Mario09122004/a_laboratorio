"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { FilePenLine, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const formSchema = z.object({
  nombreCompleto: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres." }),
  correo: z.string().email({ message: "Por favor, introduce un correo electrónico válido." }).optional().or(z.literal("")),
  telefono: z.string().optional(),
});

interface ClientActionsProps {
  cliente: Doc<"Cliente">;
}

export function ClientActions({ cliente }: ClientActionsProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const updateCliente = useMutation(api.clientes.updateCliente);
  const deleteCliente = useMutation(api.clientes.deleteCliente);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombreCompleto: cliente.nombreCompleto,
      correo: cliente.correo ?? "",
      telefono: cliente.telefono ?? "",
    },
  });

  const onUpdateSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await updateCliente({ id: cliente._id, ...values });
      toast.success("Cliente actualizado.");
      setIsEditDialogOpen(false);
    } catch (error) {
      toast.error("Error al actualizar el cliente.");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCliente({ id: cliente._id });
      toast.success("Cliente eliminado.");
    } catch (error) {
      toast.error("Error al eliminar el cliente.");
    }
  };
  
  const handleEditClick = () => {
    form.reset({
        nombreCompleto: cliente.nombreCompleto,
        correo: cliente.correo ?? "",
        telefono: cliente.telefono ?? "",
    });
    setIsEditDialogOpen(true);
  }

  return (
    <>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Cliente</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onUpdateSubmit)} className="space-y-4">
              <FormField control={form.control} name="nombreCompleto" render={({ field }) => ( <FormItem> <FormLabel>Nombre Completo</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
              <FormField control={form.control} name="correo" render={({ field }) => ( <FormItem> <FormLabel>Correo (Opcional)</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
              <FormField control={form.control} name="telefono" render={({ field }) => ( <FormItem> <FormLabel>Teléfono (Opcional)</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
              <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={form.formState.isSubmitting}> {form.formState.isSubmitting ? "Guardando..." : "Guardar Cambios"} </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>¿Estás seguro?</AlertDialogTitle><AlertDialogDescription> Esta acción no se puede deshacer. El cliente será eliminado permanentemente. </AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <TooltipProvider delayDuration={100}>
        <div className="flex items-center justify-end gap-2">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={handleEditClick}>
                        <FilePenLine className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent><p>Editar Cliente</p></TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => setIsDeleteDialogOpen(true)} className="text-red-500 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Eliminar</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent><p>Eliminar Cliente</p></TooltipContent>
            </Tooltip>
        </div>
      </TooltipProvider>
    </>
  );
}