"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import { DataTable } from "@/components/analisis/data-table";
import { columns } from "@/components/analisis/columns";
import { RegisterAnalisisButton } from "@/components/analisis/register-analisis-button";
import { hasPermission } from "@/lib/utils";
import { withPermission } from "@/components/corrobradorpermiso";
import { PageSkeleton } from "@/components/loader";

export function AnalisisPage() {
  const analisis = useQuery(api.analisis.getAnalisis);

  if (analisis === undefined) {
    return (
      <PageSkeleton />
    );
  }
  
  const puedeAgregarAnalisis = hasPermission("AgregarAnalisis");

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Catálogo de Análisis</h1>
        
        { puedeAgregarAnalisis && (
          <RegisterAnalisisButton />
        )}

      </div>
      
      <DataTable columns={columns} data={analisis} />
    </div>
  );
}

export default withPermission(
  AnalisisPage,
  "VerAnalisis",
);