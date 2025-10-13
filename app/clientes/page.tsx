"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2 } from "lucide-react";

import { DataTable } from "@/components/clientes/data-table";
import { columns } from "@/components/clientes/columns";
import { RegisterClientButton } from "@/components/clientes/register-client-button";

export default function ClientesPage() {
  const clientes = useQuery(api.clientes.getClientes);

  if (clientes === undefined) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
        <RegisterClientButton />
      </div>
      
      <DataTable columns={columns} data={clientes} />
    </div>
  );
}