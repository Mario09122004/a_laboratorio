import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Crea un nuevo permiso en el sistema.
 */
export const createPermission = mutation({
  args: {
    nombre: v.string(),
    descripcion: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("Permisos", args);
  },
});

/**
 * Obtiene todos los permisos disponibles.
 */
export const getPermissions = query({
  handler: async (ctx) => {
    return await ctx.db.query("Permisos").collect();
  },
});

/**
 * Elimina un permiso y todas sus referencias en la tabla RolPer.
 */
export const deletePermission = mutation({
  args: {
    permisoId: v.id("Permisos")
  },
  handler: async (ctx, args) => {
    const links = await ctx.db
      .query("RolPer")
      .filter((q) => q.eq(q.field("permisoId"), args.permisoId))
      .collect();
      
    await Promise.all(links.map(link => ctx.db.delete(link._id)));
    
    await ctx.db.delete(args.permisoId);
  }
});