"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2 } from "lucide-react";

import { DataTable } from "@/components/estadosMuestra/data-table";
import { columns } from "@/components/estadosMuestra/columns";
import { RegisterEstadoButton } from "@/components/estadosMuestra/register-estado-button";

export default function EstadosMuestraPage() {
  const estados = useQuery(api.estadosMuestra.getEstadosMuestra);

  if (estados === undefined) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Estados de Muestra</h1>
        <RegisterEstadoButton />
      </div>
      
      <DataTable columns={columns} data={estados} />
    </div>
  );
}
