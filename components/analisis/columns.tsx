"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Doc } from "@/convex/_generated/dataModel";
import { AnalisisActions } from "./analisis-actions";
import { Badge } from "@/components/ui/badge";

export const columns: ColumnDef<Doc<"Analisis">>[] = [
  {
    accessorKey: "nombre",
    header: "Nombre del Análisis",
  },
  {
    accessorKey: "Tipo",
    header: "Tipo",
    cell: ({ row }) => {
        return <Badge variant="outline">{row.getValue("Tipo")}</Badge>
    }
  },
  {
    accessorKey: "fechaRegistro",
    header: "Fecha de Registro",
    cell: ({ row }) => {
      const timestamp = row.getValue("fechaRegistro") as number;
      return <span>{new Date(timestamp).toLocaleDateString()}</span>;
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Acciones</div>,
    cell: ({ row }) => {
      return <AnalisisActions analisis={row.original} />;
    },
  },
];
