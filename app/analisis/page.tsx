"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2 } from "lucide-react";

import { DataTable } from "@/components/analisis/data-table";
import { columns } from "@/components/analisis/columns";
import { RegisterAnalisisButton } from "@/components/analisis/register-analisis-button";

export default function AnalisisPage() {
  const analisis = useQuery(api.analisis.getAnalisis);

  if (analisis === undefined) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Catálogo de Análisis</h1>
        <RegisterAnalisisButton />
      </div>
      
      <DataTable columns={columns} data={analisis} />
    </div>
  );
}
