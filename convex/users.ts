import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Doc } from "./_generated/dataModel";

// Inserta o actualiza un usuario proveniente de Clerk
export const upsertFromClerk = internalMutation({
  args: {
    data: v.any(), // Datos crudos enviados desde Clerk
  },
  handler: async (ctx, args) => {
    const clerkUser = args.data;

    // Extrae los campos relevantes del objeto Clerk
    const clerkId = clerkUser.id;
    const nombreCompleto = `${clerkUser.first_name || ""} ${clerkUser.last_name || ""}`.trim();
    const correo = clerkUser.email_addresses?.[0]?.email_address || "";

    // Validación mínima
    if (!clerkId || !correo) {
      console.error("Datos de usuario Clerk inválidos:", clerkUser);
      return;
    }

    // Busca si ya existe el usuario
    const existente = await ctx.db
      .query("Usuarios")
      .withIndex("by_correo", (q) => q.eq("correo", correo))
      .unique();

    const ahora = Date.now();

    if (existente) {
      // Actualiza usuario existente
      await ctx.db.patch(existente._id, {
        nombreCompleto,
        fechaActualizacion: ahora,
      });
      console.log(`Usuario actualizado: ${correo}`);
    } else {
      // Inserta nuevo usuario
      await ctx.db.insert("Usuarios", {
        nombreCompleto,
        correo,
        clerkId,
        fechaRegistro: ahora,
        fechaActualizacion: ahora,
      });
      console.log(`Usuario creado: ${correo}`);
    }
  },
});

// Elimina un usuario según su ID de Clerk
export const deleteFromClerk = internalMutation({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const usuario = await ctx.db
      .query("Usuarios")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkUserId))
      .unique();

    if (!usuario) {
      console.warn(`Usuario con Clerk ID ${args.clerkUserId} no encontrado`);
      return;
    }

    await ctx.db.delete(usuario._id);
    console.log(`Usuario eliminado con Clerk ID: ${args.clerkUserId}`);
  },
});

/////////////////////////////////////////////////////////////////////

/**
 * Obtiene todos los usuarios y enriquece cada uno con el nombre de su rol.
 */
export const getUsers = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("Usuarios").collect();
    
    const usersWithRoles = await Promise.all(
      users.map(async (user) => {
        const role = user.rol ? await ctx.db.get(user.rol) : null;
        return {
          ...user,
          roleName: role ? role.nombre : "Sin rol asignado",
        };
      })
    );
    return usersWithRoles;
  },
});

/**
 * Obtiene los datos del usuario actualmente autenticado desde la base de datos.
 */
export const getCurrentUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    return await ctx.db
      .query("Usuarios")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
  },
});

/**
 * Obtiene el rol y la lista de permisos de un usuario por su clerkId.
 */
export const getUserRoleAndPermissions = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Encontrar al usuario por su clerkId
    const user = await ctx.db
      .query("Usuarios")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) {
      return null;
    }

    // 2. Si el usuario no tiene un rol, devolver un estado por defecto
    if (!user.rol) {
      return {
        roleName: "Sin rol asignado",
        permissions: [],
      };
    }

    // 3. Obtener el documento del rol
    const role = await ctx.db.get(user.rol);
    if (!role) {
      return {
        roleName: "Rol no encontrado",
        permissions: [],
      };
    }

    // 4. Obtener las relaciones entre el rol y los permisos
    const permissionLinks = await ctx.db
      .query("RolPer")
      .filter((q) => q.eq(q.field("rolId"), user.rol!)) // Nota: Para optimizar, considera añadir un índice en `rolId` en tu tabla RolPer.
      .collect();

    if (permissionLinks.length === 0) {
      return {
        roleName: role.nombre,
        permissions: [],
      };
    }

    // 5. Obtener los documentos de los permisos y extraer sus nombres
    const permissionIds = permissionLinks.map(link => link.permisoId);
    const permissions = await Promise.all(
      permissionIds.map(id => ctx.db.get(id))
    );
    
    const permissionNames = permissions
      .filter((p): p is Doc<"Permisos"> => p !== null)
      .map(p => p.nombre);

    // 6. Devolver el objeto final
    return {
      roleName: role.nombre,
      permissions: permissionNames,
    };
  },
});


/**
 * Asigna un rol a un usuario específico.
 */
export const assignRoleToUser = mutation({
  args: {
    userId: v.id("Usuarios"),
    roleId: v.id("Roles"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      rol: args.roleId,
      fechaActualizacion: Date.now(),
    });
  },
});