"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2 } from "lucide-react";

import { DataTable } from "@/components/estadosMuestra/data-table";
import { columns } from "@/components/estadosMuestra/columns";
import { RegisterEstadoButton } from "@/components/estadosMuestra/register-estado-button";
import { hasPermission } from "@/lib/utils";

export default function EstadosMuestraPage() {
  const [isClient, setIsClient] = useState(false);
  const estados = useQuery(api.estadosMuestra.getEstadosMuestra);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (estados === undefined) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const puedeAgregarEstados = hasPermission("AgregarEstados");

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Estados de Muestra</h1>
        
        {isClient && puedeAgregarEstados && (
          <RegisterEstadoButton />
        )}

      </div>
      
      <DataTable columns={columns} data={estados} />
    </div>
  );
}