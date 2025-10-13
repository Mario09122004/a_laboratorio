"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { hasPermission } from "@/lib/utils";

interface NotasManagerProps {
  muestraId: Id<"Muestras">;
}

export function NotasManager({ muestraId }: NotasManagerProps) {
  const [nuevaNota, setNuevaNota] = useState("");
  const notas = useQuery(api.notas.getNotasPorMuestra, { muestraId });

  const createNota = useMutation(api.notas.createNota);
  const updateNota = useMutation(api.notas.updateNota);
  const deleteNota = useMutation(api.notas.deleteNota);

  const handleCreateNota = async () => {
    if (nuevaNota.trim() === "") {
      toast.error("El contenido de la nota no puede estar vacío.");
      return;
    }
    try {
      await createNota({ muestraId, contenido: nuevaNota });
      setNuevaNota("");
      toast.success("Nota creada.");
    } catch (error) {
      toast.error("Error al crear la nota.");
    }
  };

  const handleToggleCompletado = (nota: Doc<"Notas">) => {
    updateNota({ id: nota._id, completado: !nota.completado });
  };

  const handleDeleteNota = (id: Id<"Notas">) => {
    deleteNota({ id });
    toast.info("Nota eliminada.");
  };

  //Consultar permisos
  const puedeEliminarNotas = hasPermission("EliminarNotas");
  const puedeAgregarNotas = hasPermission("AgregarNotas");
  const puedeTacharNotas = hasPermission("VerNotas");

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex gap-2 mb-4">
        <Input
          value={nuevaNota}
          onChange={(e) => setNuevaNota(e.target.value)}
          placeholder="Añadir una nueva nota..."
          onKeyDown={(e) => e.key === 'Enter' && handleCreateNota()}
        />
        <Button onClick={handleCreateNota} disabled={!nuevaNota.trim()}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {notas === undefined && (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {notas && notas.length === 0 && (
          <div className="text-center text-muted-foreground pt-10">
            No hay notas para esta muestra.
          </div>
        )}

        {notas && notas.length > 0 && (
          <ul className="space-y-2">
            <TooltipProvider>
              {notas.map((nota) => (
                <li key={nota._id} className="flex items-center gap-3 p-2 border rounded-md">
                  <Checkbox
                    checked={nota.completado}
                    onCheckedChange={() => handleToggleCompletado(nota)}
                    id={`nota-${nota._id}`}
                  />
                  <label
                    htmlFor={`nota-${nota._id}`}
                    className={`flex-1 text-sm ${nota.completado ? 'line-through text-muted-foreground' : ''}`}
                  >
                    {nota.contenido}
                  </label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteNota(nota._id)}
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Eliminar Nota</p>
                    </TooltipContent>
                  </Tooltip>
                </li>
              ))}
            </TooltipProvider>
          </ul>
        )}
      </div>
    </div>
  );
}