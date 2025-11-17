"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import { DataTable } from "@/components/estadosMuestra/data-table";
import { columns } from "@/components/estadosMuestra/columns";
import { RegisterEstadoButton } from "@/components/estadosMuestra/register-estado-button";
import { hasPermission } from "@/lib/utils";
import { withPermission } from "@/components/corrobradorpermiso";
import { PageSkeleton } from "@/components/loader";

export function EstadosMuestraPage() {
  const [isClient, setIsClient] = useState(false);
  const estados = useQuery(api.estadosMuestra.getEstadosMuestra);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (estados === undefined) {
    return (
      <PageSkeleton />
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

export default withPermission(
  EstadosMuestraPage,
  "VerEstados",
);