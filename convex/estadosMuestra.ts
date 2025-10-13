import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getEstadosMuestra = query({
  handler: async (ctx) => {
    
    const estados = await ctx.db.query("EstadosMuestra").order("asc").collect();
    return estados;
  },
});

export const getEstadoMuestraById = query({
  args: {
    id: v.id("EstadosMuestra"),
  },
  handler: async (ctx, args) => {
    const estadoMuestra = await ctx.db.get(args.id);
    if (!estadoMuestra) {
      throw new Error("Estado de muestra no encontrado");
    }
    return estadoMuestra;
  },
});

export const createEstadoMuestra = mutation({
  args: {
    estado: v.string(),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const estadoMuestraId = await ctx.db.insert("EstadosMuestra", {
      ...args,
      fechaRegistro: now,
      fechaActualizacion: now,
    });
    return estadoMuestraId;
  },
});

export const updateEstadoMuestra = mutation({
  args: {
    id: v.id("EstadosMuestra"),
    estado: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    
    await ctx.db.patch(id, {
      ...rest,
      fechaActualizacion: Date.now(),
    });
  },
});

export const deleteEstadoMuestra = mutation({
  args: {
    id: v.id("EstadosMuestra"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});