"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import { DataTable } from "@/components/clientes/data-table";
import { columns } from "@/components/clientes/columns";
import { RegisterClientButton } from "@/components/clientes/register-client-button";
import { hasPermission } from "@/lib/utils";
import { withPermission } from "@/components/corrobradorpermiso";
import { PageSkeleton } from "@/components/loader";

export function ClientesPage() {
  const [isClient, setIsClient] = useState(false);
  const clientes = useQuery(api.clientes.getClientes);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (clientes === undefined) {
    return (
      <PageSkeleton />
    );
  }

  const puedeAgregarClientes = hasPermission("AgregarClientes");

  return (
    <div className="mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
        
        {isClient && puedeAgregarClientes && (
          <RegisterClientButton />
        )}

      </div>
      
      <DataTable columns={columns} data={clientes} />
    </div>
  );
}

export default withPermission(
  ClientesPage,
  "VerClientes",
);