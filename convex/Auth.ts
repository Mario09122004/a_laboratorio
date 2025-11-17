import { v } from "convex/values";
import { query } from "./_generated/server";

export const hasPermission = query({
  args: {
    clerkId: v.string(),
    permissionName: v.string(),
  },

  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("Usuarios")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user || !user.rol) {
      return false;
    }

    const permission = await ctx.db
      .query("Permisos")
      .withIndex("by_nombre", (q) => q.eq("nombre", args.permissionName))
      .unique();

    if (!permission) {
      return false;
    }

    const rolePermissionLink = await ctx.db
      .query("RolPer")
      .withIndex("by_rol_and_permission", (q) =>
        q.eq("rolId", user.rol!)
         .eq("permisoId", permission._id)
      )
      .first();

    return !!rolePermissionLink;
  },
});