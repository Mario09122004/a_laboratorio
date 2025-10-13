import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Crea un nuevo rol.
 */
export const createRole = mutation({
  args: { nombre: v.string() },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("Roles", {
      nombre: args.nombre,
      fechaRegistro: now,
      fechaActualizacion: now,
    });
  },
});

/**
 * Obtiene todos los roles disponibles.
 */
export const getRoles = query({
  handler: async (ctx) => {
    return await ctx.db.query("Roles").order("asc").collect();
  },
});

/**
 * Obtiene un rol específico junto con una lista de todos los permisos que tiene asignados.
 */
export const getRoleWithPermissions = query({
  args: { roleId: v.id("Roles") },
  handler: async (ctx, args) => {
    const role = await ctx.db.get(args.roleId);
    if (!role) return null;

    const rolePermissionLinks = await ctx.db
      .query("RolPer")
      .filter((q) => q.eq(q.field("rolId"), args.roleId))
      .collect();
      
    const permissionIds = rolePermissionLinks.map(link => link.permisoId);
    
    const permissions = await Promise.all(
        permissionIds.map(id => ctx.db.get(id))
    );

    return {
      ...role,
      permissions: permissions.filter(p => p !== null),
    };
  },
});

/**
 * Elimina un rol y todas sus asignaciones de permisos en la tabla RolPer.
 */
export const deleteRole = mutation({
  args: { roleId: v.id("Roles") },
  handler: async (ctx, args) => {
    const permissionLinks = await ctx.db
      .query("RolPer")
      .filter((q) => q.eq(q.field("rolId"), args.roleId))
      .collect();

    await Promise.all(permissionLinks.map(link => ctx.db.delete(link._id)));

    await ctx.db.delete(args.roleId);
  },
});

// --- Gestión de Permisos por Rol ---

/**
 * Asigna un permiso a un rol. No crea duplicados si ya existe la asignación.
 */
export const assignPermissionToRole = mutation({
  args: {
    rolId: v.id("Roles"),
    permisoId: v.id("Permisos"),
  },
  handler: async (ctx, args) => {
    const existingLink = await ctx.db
      .query("RolPer")
      .filter((q) => 
        q.and(
          q.eq(q.field("rolId"), args.rolId),
          q.eq(q.field("permisoId"), args.permisoId)
        )
      )
      .first();

    if (existingLink) {
      return existingLink._id;
    }
    
    return await ctx.db.insert("RolPer", args);
  },
});

/**
 * Remueve un permiso de un rol.
 */
export const removePermissionFromRole = mutation({
  args: {
    rolId: v.id("Roles"),
    permisoId: v.id("Permisos"),
  },
  handler: async (ctx, args) => {
    const linkToDelete = await ctx.db
      .query("RolPer")
      .filter((q) =>
        q.and(
          q.eq(q.field("rolId"), args.rolId),
          q.eq(q.field("permisoId"), args.permisoId)
        )
      )
      .first();

    if (linkToDelete) {
      await ctx.db.delete(linkToDelete._id);
    }
  },
});