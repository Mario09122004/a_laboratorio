import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    Cliente: defineTable({
        nombreCompleto: v.string(),
        correo: v.optional(v.string()),
        telefono: v.optional(v.string()),
        fechaRegistro: v.number(),
        fechaActualizacion: v.number(),
    })
        .index("by_nombre", ["nombreCompleto"]),

    EstadosMuestra: defineTable({
        estado: v.string(),
        color: v.string(),
        fechaRegistro: v.number(),
        fechaActualizacion: v.number(),
    })
        .index("by_estado", ["estado"]),

    Analisis: defineTable({
        nombre: v.string(),
        descripcion: v.optional(v.string()),
        Campos: v.array(
            v.object({
                nombre: v.string(),
                medicion: v.string(),
                valorReferencia: v.string(),
        })),
        Tipo: v.union(
            v.literal("Hematología clínica"), 
            v.literal("Perfil de rutina"), 
            v.literal("Química clínica"),
            v.literal("Coprología"),
            v.literal("Serología"),
            v.literal("Uroanálisis"),
            v.literal("Hormonales"),
        ),
        fechaRegistro: v.number(),
        fechaActualizacion: v.number(),
    })
        .index("by_nombre", ["nombre"]),

    Muestras: defineTable({
        clienteId: v.id("Cliente"),
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
        estado: v.id("EstadosMuestra"),
        analisisNombre: v.string(),
        fechaRegistro: v.number(),
        fechaActualizacion: v.number(),
    }),

    Notas: defineTable({
        muestraId: v.id("Muestras"),
        contenido: v.string(),
        completado: v.boolean(),
        fechaRegistro: v.number(),
        fechaActualizacion: v.number(),
    }).index("por_muestra", ["muestraId"]),

    Usuarios: defineTable({
        nombreCompleto: v.string(),
        correo: v.string(),
        clerkId: v.string(),
        fechaRegistro: v.number(),
        fechaActualizacion: v.number(),
        rol: v.optional(v.id("Roles")),
    })
        .index("by_correo", ["correo"])
        .index("by_clerkId", ["clerkId"]),

    Roles: defineTable({
        nombre: v.string(),
        fechaRegistro: v.number(),
        fechaActualizacion: v.number(),
    }).index("by_nombre", ["nombre"]),

    RolPer: defineTable({
        rolId: v.id("Roles"),
        permisoId: v.id("Permisos"),
    })
    .index("by_rol_and_permission", ["rolId", "permisoId"])
    .index("by_rolId", ["rolId"]),

    Permisos: defineTable({
        nombre: v.string(),
        descripcion: v.string(),
    }).index("by_nombre", ["nombre"]),
});