import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const analisisFields = {
  nombre: v.string(),
  descripcion: v.optional(v.string()),
  Campos: v.array(
    v.object({
      nombre: v.string(),
      medicion: v.string(),
      valorReferencia: v.string(),
    })
  ),
  Tipo: v.union(
    v.literal("Hematología clínica"),
    v.literal("Perfil de rutina"),
    v.literal("Química clínica"),
    v.literal("Coprología"),
    v.literal("Serología"),
    v.literal("Uroanálisis"),
    v.literal("Hormonales")
  ),
};

export const getAnalisis = query({
  handler: async (ctx) => {
    const analisis = await ctx.db.query("Analisis").order("desc").collect();
    return analisis;
  },
});

export const getAnalisisById = query({
  args: {
    id: v.id("Analisis"),
  },
  handler: async (ctx, args) => {
    const analisis = await ctx.db.get(args.id);
    if (!analisis) {
      throw new Error("Análisis no encontrado");
    }
    return analisis;
  },
});

export const createAnalisis = mutation({
  args: analisisFields,
  handler: async (ctx, args) => {
    const now = Date.now();
    const analisisId = await ctx.db.insert("Analisis", {
      ...args,
      fechaRegistro: now,
      fechaActualizacion: now,
    });
    return analisisId;
  },
});

export const updateAnalisis = mutation({
  args: {
    id: v.id("Analisis"),
    nombre: v.optional(v.string()),
    descripcion: v.optional(v.string()),
    Campos: v.optional(v.array(
      v.object({
        nombre: v.string(),
        medicion: v.string(),
        valorReferencia: v.string(),
      })
    )),
    Tipo: v.optional(v.union(
      v.literal("Hematología clínica"),
      v.literal("Perfil de rutina"),
      v.literal("Química clínica"),
      v.literal("Coprología"),
      v.literal("Serología"),
      v.literal("Uroanálisis"),
      v.literal("Hormonales")
    )),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    
    await ctx.db.patch(id, {
      ...rest,
      fechaActualizacion: Date.now(),
    });
  },
});

export const deleteAnalisis = mutation({
  args: {
    id: v.id("Analisis"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});