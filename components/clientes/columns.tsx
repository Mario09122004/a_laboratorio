"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Doc } from "@/convex/_generated/dataModel";
import { ClientActions } from "./client-actions";

export const columns: ColumnDef<Doc<"Cliente">>[] = [
  {
    accessorKey: "nombreCompleto",
    header: "Nombre Completo",
  },
  {
    accessorKey: "correo",
    header: "Correo Electrónico",
  },
  {
    accessorKey: "telefono",
    header: "Teléfono",
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
    header: "Acciones",
    cell: ({ row }) => {
      return <ClientActions cliente={row.original} />;
    },
  },
];