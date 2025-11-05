"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { MuestraActions } from "./muestra-actions";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Doc } from "@/convex/_generated/dataModel"; 

type MuestraConDetalles = Doc<"Muestras"> & { 
  clienteNombre: string; 
  estadoNombre: string; 
  estadoColor: string; 
  analisisNombre: string; 
};


interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: { columnFilters },
    getColumnCanGlobalFilter: () => true,
  });

  return (
    <div>
      <div className="hidden rounded-md border md:block">
        <Table>
          <TableHeader>{table.getHeaderGroups().map((headerGroup) => (<TableRow key={headerGroup.id}>{headerGroup.headers.map((header) => (<TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>))}</TableRow>))}</TableHeader>
          <TableBody>{table.getRowModel().rows?.length ? (table.getRowModel().rows.map((row) => (<TableRow key={row.id}>{row.getVisibleCells().map((cell) => (<TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>))}</TableRow>))) : (<TableRow><TableCell colSpan={columns.length} className="h-24 text-center">No se encontraron resultados.</TableCell></TableRow>)}</TableBody>
        </Table>
      </div>

      <div className="grid gap-4 md:hidden">
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => {
            const muestra = row.original as MuestraConDetalles;
            return (
              <Card key={muestra._id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span>{muestra.clienteNombre}</span>
                    <MuestraActions muestra={muestra} />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-sm text-muted-foreground">Estado</span>
                    <Badge style={{ backgroundColor: muestra.estadoColor, color: '#fff' }}>{muestra.estadoNombre}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Registro</span>
                    <span className="text-sm font-medium">{new Date(muestra.fechaRegistro).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="py-10 text-center text-muted-foreground">No se encontraron resultados.</div>
        )}
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Anterior</Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Siguiente</Button>
      </div>
    </div>
  );
}