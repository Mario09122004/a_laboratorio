"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { PlusCircle, Trash } from "lucide-react";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const tiposDeAnalisis = ["Hematología clínica", "Perfil de rutina", "Química clínica", "Coprología", "Serología", "Uroanálisis", "Hormonales"] as const;

const formSchema = z.object({
  nombre: z.string().min(1, { message: "El nombre es requerido." }),
  descripcion: z.string().optional(),
  Tipo: z.enum(tiposDeAnalisis, { required_error: "Debe seleccionar un tipo de análisis." }),
  Campos: z.array(z.object({
      nombre: z.string().min(1, { message: "Requerido" }),
      medicion: z.string().min(1, { message: "Requerido" }),
      valorReferencia: z.string().min(1, { message: "Requerido" }),
  })).min(1, { message: "Debe agregar al menos un campo." }),
});

export function RegisterAnalisisButton() {
  const [isOpen, setIsOpen] = useState(false);
  const createAnalisis = useMutation(api.analisis.createAnalisis);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "",
      descripcion: "",
      Campos: [{ nombre: "", medicion: "", valorReferencia: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "Campos"
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await createAnalisis(values);
      toast.success("Análisis registrado con éxito.");
      form.reset();
      setIsOpen(false);
    } catch (error) {
      toast.error("Hubo un error al registrar el análisis.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild><Button><PlusCircle className="h-4 w-4 mr-2" />Registrar Análisis</Button></DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Registrar Nuevo Análisis</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="nombre" render={({ field }) => ( <FormItem> <FormLabel>Nombre del Análisis</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
              <FormField control={form.control} name="Tipo" render={({ field }) => ( <FormItem> <FormLabel>Tipo de Análisis</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl><SelectTrigger><SelectValue placeholder="Seleccione un tipo" /></SelectTrigger></FormControl> <SelectContent> {tiposDeAnalisis.map(tipo => <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>)} </SelectContent> </Select> <FormMessage /> </FormItem> )}/>
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
              <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Guardando..." : "Guardar Análisis"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}