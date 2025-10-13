import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getNotasPorMuestra = query({
  args: {
    muestraId: v.id("Muestras"),
  },
  handler: async (ctx, args) => {
    const notas = await ctx.db
      .query("Notas")
      .withIndex("por_muestra", (q) => q.eq("muestraId", args.muestraId))
      .order("desc")
      .collect();
    return notas;
  },
});

export const createNota = mutation({
  args: {
    muestraId: v.id("Muestras"),
    contenido: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const notaId = await ctx.db.insert("Notas", {
      muestraId: args.muestraId,
      contenido: args.contenido,
      completado: false,
      fechaRegistro: now,
      fechaActualizacion: now,
    });
    return notaId;
  },
});

export const updateNota = mutation({
  args: {
    id: v.id("Notas"),
    contenido: v.optional(v.string()),
    completado: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    
    await ctx.db.patch(id, {
      ...rest,
      fechaActualizacion: Date.now(),
    });
  },
});

export const deleteNota = mutation({
  args: {
    id: v.id("Notas"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});