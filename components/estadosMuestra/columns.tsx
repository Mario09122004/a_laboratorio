"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Doc } from "@/convex/_generated/dataModel";
import { EstadoActions } from "./estado-actions";

export const columns: ColumnDef<Doc<"EstadosMuestra">>[] = [
  {
    accessorKey: "estado",
    header: "Estado",
  },
  {
    accessorKey: "color",
    header: "Color",
    cell: ({ row }) => {
      const color = row.getValue("color") as string;
      return (
        <div className="flex items-center gap-2">
          <div
            className="h-5 w-5 rounded-full border"
            style={{ backgroundColor: color }}
          />
          <span>{color}</span>
        </div>
      );
    },
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
      return <EstadoActions estado={row.original} />;
    },
  },
];