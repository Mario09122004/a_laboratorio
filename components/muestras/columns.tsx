"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Doc } from "@/convex/_generated/dataModel";
import { MuestraActions } from "./muestra-actions";
import { Badge } from "@/components/ui/badge";

type MuestraConDetalles = Doc<"Muestras"> & {
  clienteNombre: string;
  estadoNombre: string;
  estadoColor: string;
  analisisNombre: string;
};

export const columns: ColumnDef<MuestraConDetalles>[] = [
  {
    accessorKey: "clienteNombre",
    header: "Cliente",
  },
  {
    accessorKey: "analisisNombre",
    header: "Tipo de Análisis",
  },
  {
    accessorKey: "estadoNombre",
    header: "Estado",
    cell: ({ row }) => {
      const { estadoNombre, estadoColor } = row.original;
      return <Badge style={{ backgroundColor: estadoColor, color: '#fff' }}>{estadoNombre}</Badge>;
    },
  },
  {
    accessorKey: "fechaRegistro",
    header: "Fecha de Registro",
    cell: ({ row }) => {
      return <span>{new Date(row.original.fechaRegistro).toLocaleDateString()}</span>;
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Acciones</div>,
    cell: ({ row }) => {
      return <MuestraActions muestra={row.original} />;
    },
  },
];