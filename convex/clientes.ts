import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getClientes = query({
  handler: async (ctx) => {
    const clientes = await ctx.db.query("Cliente").order("desc").collect();
    return clientes;
  },
});

export const getClienteById = query({
  args: {
    clienteId: v.id("Cliente"),
  },
  handler: async (ctx, args) => {
    const cliente = await ctx.db.get(args.clienteId);
    return cliente;
  },
});

export const createCliente = mutation({
  args: {
    nombreCompleto: v.string(),
    correo: v.optional(v.string()),
    telefono: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const timestamp = Date.now();

    const clienteId = await ctx.db.insert("Cliente", {
      nombreCompleto: args.nombreCompleto,
      correo: args.correo,
      telefono: args.telefono,
      fechaRegistro: timestamp,
      fechaActualizacion: timestamp,
    });

    return clienteId;
  },
});

export const updateCliente = mutation({
  args: {
    id: v.id("Cliente"),
    nombreCompleto: v.optional(v.string()),
    correo: v.optional(v.string()),
    telefono: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args; 

    await ctx.db.patch(id, {
      ...rest,
      fechaActualizacion: Date.now(), 
    });
  },
});

export const deleteCliente = mutation({
  args: {
    id: v.id("Cliente"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});