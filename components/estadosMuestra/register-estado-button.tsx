"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { PlusCircle } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// Esquema de Zod con validación para color hexadecimal
const formSchema = z.object({
  estado: z.string().min(1, { message: "El nombre del estado es requerido." }),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, {
    message: "Debe ser un color hexadecimal válido (ej: #FFFFFF).",
  }),
});

export function RegisterEstadoButton() {
  const [isOpen, setIsOpen] = useState(false);
  const createEstado = useMutation(api.estadosMuestra.createEstadoMuestra);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      estado: "",
      color: "#000000",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await createEstado(values);
      toast.success("Estado registrado con éxito.");
      form.reset();
      setIsOpen(false);
    } catch (error) {
      toast.error("Hubo un error al registrar el estado.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild><Button><PlusCircle className="h-4 w-4 mr-2" />Registrar Estado</Button></DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Registrar Nuevo Estado</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="estado" render={({ field }) => ( <FormItem> <FormLabel>Nombre del Estado</FormLabel> <FormControl><Input placeholder="Ej: Recibido" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
            <FormField control={form.control} name="color" render={({ field }) => ( 
                <FormItem> 
                    <FormLabel>Color</FormLabel>
                    <div className="flex items-center gap-2">
                        <FormControl>
                            <Input type="color" className="p-1 h-10 w-14" {...field} />
                        </FormControl>
                        <Input placeholder="#FFFFFF" {...field} />
                    </div>
                    <FormMessage /> 
                </FormItem> 
            )}/>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Guardando..." : "Guardar Estado"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}