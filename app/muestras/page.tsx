"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2, X } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";

import { DataTable } from "@/components/muestras/data-table";
import { columns } from "@/components/muestras/columns";
import { RegisterMestraButton } from "@/components/muestras/register-muestra-button";
import { ScanMuestraButton } from "@/components/muestras/ScanMuestraButton"; 

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { withPermission } from "@/components/corrobradorpermiso";

export function MuestrasPage() {
  const [clienteInput, setClienteInput] = useState("");
  const [estadoInput, setEstadoInput] = useState<string | undefined>();
  const [fechaInicioInput, setFechaInicioInput] = useState<Date | undefined>();
  const [fechaFinInput, setFechaFinInput] = useState<Date | undefined>();

  const estados = useQuery(api.estadosMuestra.getEstadosMuestra);
  const todasLasMuestras = useQuery(api.muestras.getMuestras);

  const filteredData = useMemo(() => {
    if (!todasLasMuestras) {
      return [];
    }

    let data = [...todasLasMuestras];

    if (clienteInput) {
      data = data.filter(m => m.clienteNombre.toLowerCase().includes(clienteInput.toLowerCase()));
    }
    if (estadoInput) {
      data = data.filter(m => m.estado === estadoInput);
    }
    if (fechaInicioInput && fechaFinInput) {
      const from = new Date(fechaInicioInput).setHours(0, 0, 0, 0);
      const to = new Date(fechaFinInput).setHours(23, 59, 59, 999);
      if (from <= to) {
        data = data.filter(m => m.fechaRegistro >= from && m.fechaRegistro <= to);
      }
    }
    return data;
  }, [clienteInput, estadoInput, fechaInicioInput, fechaFinInput, todasLasMuestras]);

  const limpiarFiltros = () => {
    setClienteInput("");
    setEstadoInput(undefined);
    setFechaInicioInput(undefined);
    setFechaFinInput(undefined);
  };

  const isLoading = todasLasMuestras === undefined || estados === undefined;

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Muestras</h1>
        <div className="flex gap-2">
          <ScanMuestraButton todasLasMuestras={todasLasMuestras ?? []} />
          <RegisterMestraButton /> 
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-2 items-center p-4 border rounded-lg mb-6">
        <Input
          placeholder="Filtrar por cliente..."
          value={clienteInput}
          onChange={(e) => setClienteInput(e.target.value)}
          className="flex-1"
        />
        <Select value={estadoInput} onValueChange={setEstadoInput}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Filtrar por estado..." />
          </SelectTrigger>
          <SelectContent>
            {estados?.map((e) => (
              <SelectItem key={e._id} value={e._id}>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full border" style={{ backgroundColor: e.color }} />
                  <span>{e.estado}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <DatePicker
          date={fechaInicioInput}
          setDate={setFechaInicioInput}
          placeholder="Fecha de inicio"
          className="flex-1"
        />
        <DatePicker
          date={fechaFinInput}
          setDate={setFechaFinInput}
          placeholder="Fecha de fin"
          className="flex-1"
        />

        <Button onClick={limpiarFiltros} variant="ghost" className="shrink-0">
          <X className="h-4 w-4 mr-2" />
          Limpiar
        </Button>
      </div>
      
      {isLoading ? (
        <div className="w-full h-full flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DataTable columns={columns} data={filteredData} />
      )}
    </div>
  );
}

export default withPermission(
  MuestrasPage,
  "VerMuestras",
);