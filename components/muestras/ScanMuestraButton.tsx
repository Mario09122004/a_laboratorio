// components/muestras/ScanMuestraButton.tsx

"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { QrCode } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { QrScanner } from "@yudiel/react-qr-scanner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { hasPermission } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";

type MuestraConDetalles = Doc<"Muestras"> & { 
  clienteNombre: string; 
  estadoNombre: string;
  estadoColor: string; 
  analisisNombre: string; 
};

const formSchema = z.object({
  estado: z.string().min(1),
  resultados: z.array(z.object({
      nombre: z.string(),
      medicion: z.string(),
      estandar: z.string(),
      valor: z.string().nullable().optional(),
  })),
});

interface ScanMuestraButtonProps {
  todasLasMuestras: MuestraConDetalles[];
}

export function ScanMuestraButton({ todasLasMuestras }: ScanMuestraButtonProps) {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedMuestra, setScannedMuestra] = useState<MuestraConDetalles | null>(null);
  
  const { isLoaded } = useUser();
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const estados = useQuery(api.estadosMuestra.getEstadosMuestra);
  const updateMuestra = useMutation(api.muestras.updateMuestra);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  const { fields } = useFieldArray({ control: form.control, name: "resultados" });

  useEffect(() => {
    if (scannedMuestra) {
      form.reset({
        estado: scannedMuestra.estado,
        resultados: (scannedMuestra.resultados ?? []).map(r => ({ ...r, valor: r.valor === null || r.valor === undefined ? '' : String(r.valor) })),
      });
    }
  }, [scannedMuestra, form]);

  const onUpdateSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!scannedMuestra) return;
    try {
      await updateMuestra({
        id: scannedMuestra._id,
        estado: values.estado as Id<"EstadosMuestra">,
        resultados: values.resultados.map(r => ({ 
          ...r, 
          valor: (r.valor === '' || r.valor === undefined) ? null : r.valor 
        })),
      });
      toast.success("Muestra actualizada.");
      setScannedMuestra(null);
    } catch (error: unknown) {
        toast.error("Error al actualizar la muestra.");
    }
  };

  // Funciones para manejar el resultado del scanner
  const handleScanSuccess = (result: string) => {
    const decodedText = result;
    setIsScannerOpen(false); // Cerrar modal del scanner
    
    const foundMuestra = todasLasMuestras.find(m => m._id === decodedText);

    if (foundMuestra) {
      setScannedMuestra(foundMuestra); // Abrir modal de edición
    } else {
      toast.error("Muestra no encontrada. El QR no es válido.");
    }
  };

  const handleScanError = (error: unknown) => {
    console.error("Error de QR Scanner:", error);

    if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
            toast.error("Acceso a la cámara denegado.");
        } else {
            toast.error("Error del scanner: " + error.message);
        }
    } else {
        toast.error("Error desconocido del scanner.");
    }
    
    // Cierra el scanner si falla
    setIsScannerOpen(false);
  };

  const puedeEscanear = hasPermission("EditarMuestra");

  if (!isClient || !isLoaded || !puedeEscanear) {
    return null;
  }

  return (
    <>
      <Button variant="outline" onClick={() => setIsScannerOpen(true)}>
        <QrCode className="h-4 w-4 mr-2" />
        Escanear Muestra
      </Button>

      <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Escanear QR de la Muestra</DialogTitle>
          </DialogHeader>
          
          {isScannerOpen && (
            <div className="overflow-hidden rounded-md">
              <QrScanner
                onDecode={handleScanSuccess}
                onError={handleScanError}
                constraints={{
                  facingMode: "environment"
                }}
                scanDelay={1000}
              />
            </div>
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsScannerOpen(false)}>Cancelar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!scannedMuestra} onOpenChange={(open) => !open && setScannedMuestra(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Editar Muestra (Escaneada)</DialogTitle></DialogHeader>
          {scannedMuestra && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onUpdateSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2"><FormLabel>Cliente</FormLabel><Input value={scannedMuestra.clienteNombre} disabled /></div>
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
                        <FormField control={form.control} name={`resultados.${index}.valor`} render={({ field }) => ( 
                          <FormItem>
                            <FormControl>
                              <Input placeholder="Valor..." {...field} value={field.value ?? ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem> 
                        )}/>
                      </div>
                    ))}
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="secondary" onClick={() => setScannedMuestra(null)}>Cancelar</Button>
                  <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Guardando..." : "Guardar Cambios"}</Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}