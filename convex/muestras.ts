import { v } from "convex/values";
import {
  mutation,
  query,
  internalQuery
} from "./_generated/server";
import { internal } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";

export const getMuestras = query({
  handler: async (ctx) => {
    const muestras = await ctx.db.query("Muestras").order("desc").collect();

    const muestrasConDetalles = await Promise.all(
      muestras.map(async (muestra) => {
        const cliente = await ctx.db.get(muestra.clienteId);
        const estadoMuestra = await ctx.db.get(muestra.estado);
        return {
          ...muestra,
          clienteNombre: cliente?.nombreCompleto ?? "N/A",
          estadoNombre: estadoMuestra?.estado ?? "N/A",
          estadoColor: estadoMuestra?.color ?? "#808080",
        };
      })
    );
    return muestrasConDetalles;
  },
});


export const getMuestraById = query({
  args: {
    id: v.id("Muestras"),
  },
  handler: async (ctx, args) => {
    const muestra = await ctx.db.get(args.id);
    if (!muestra) {
      throw new Error("Muestra no encontrada");
    }
    const cliente = await ctx.db.get(muestra.clienteId);
    const estadoMuestra = await ctx.db.get(muestra.estado);
    return {
      ...muestra,
      clienteNombre: cliente?.nombreCompleto ?? "Cliente no encontrado",
      estadoNombre: estadoMuestra?.estado ?? "Estado no definido",
      estadoColor: estadoMuestra?.color ?? "#808080",
    };
  },
});

export const internalGetAnalisisById = internalQuery({
  args: {
    id: v.id("Analisis"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const createMuestra = mutation({
  args: {
    clienteId: v.id("Cliente"),
    analisisId: v.id("Analisis"),
    estado: v.id("EstadosMuestra"),
    analisisNombre: v.string(),
  },
  handler: async (ctx, args): Promise<Id<"Muestras">> => {
    const analisis: Doc<"Analisis"> | null = await ctx.runQuery(
      internal.muestras.internalGetAnalisisById,
      { id: args.analisisId }
    );
    if (!analisis) {
      throw new Error("El tipo de análisis seleccionado no existe.");
    }
    const resultadosIniciales = analisis.Campos.map((campo) => ({
      nombre: campo.nombre,
      medicion: campo.medicion,
      estandar: campo.valorReferencia,
      valor: null,
    }));
    const now = Date.now();
    const muestraId = await ctx.db.insert("Muestras", {
      clienteId: args.clienteId,
      estado: args.estado,
      analisisNombre: args.analisisNombre,
      resultados: resultadosIniciales,
      fechaRegistro: now,
      fechaActualizacion: now,
    });

    return muestraId;
  },
});

export const updateMuestra = mutation({
  args: {
    id: v.id("Muestras"),
    clienteId: v.optional(v.id("Cliente")),
    estado: v.optional(v.id("EstadosMuestra")),
    resultados: v.optional(
      v.array(
        v.object({
          nombre: v.string(),
          medicion: v.string(),
          estandar: v.string(),
          valor: v.union(v.string(), v.number(), v.boolean(), v.null()),
        })
     )
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    await ctx.db.patch(id, {
      ...rest,
     fechaActualizacion: Date.now(),
    });
  },
});


export const deleteMuestra = mutation({
  args: {
    id: v.id("Muestras"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});