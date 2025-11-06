import { query } from "./_generated/server";

export const getDashboardStats = query({
  handler: async (ctx) => {
    // 1. Obtener todas las muestras y clientes
    const muestras = await ctx.db.query("Muestras").collect();
    const clientes = await ctx.db.query("Cliente").collect();

    // 2. Calcular conteos simples
    const totalClientes = clientes.length;

    // Contar muestras pendientes (si no hay array, está vacío, o algún 'valor' es null)
    const muestrasSinResultados = muestras.filter(
      (m) =>
        !m.resultados || // Si el array 'resultados' no existe
        m.resultados.length === 0 || // O si el array está vacío
        m.resultados.some((r) => r.valor === null) // O si ALGÚN resultado tiene un valor nulo
    ).length;

    // 3. Calcular límites de tiempo
    const now = new Date();
    
    // Inicio del día (hoy a las 00:00)
    const startOfDay = new Date(now).setHours(0, 0, 0, 0);
    
    // Inicio de la semana (Lunes a las 00:00)
    const dayOfWeek = now.getDay(); // 0 (Domingo) - 6 (Sábado)
    const diff = (dayOfWeek === 0) ? 6 : (dayOfWeek - 1); // 0 (Lunes) - 6 (Domingo)
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff).setHours(0, 0, 0, 0);
    
    // Inicio del mes (Día 1 a las 00:00)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).setHours(0, 0, 0, 0);
    
    // Inicio del año (1 de Enero a las 00:00)
    const startOfYear = new Date(now.getFullYear(), 0, 1).setHours(0, 0, 0, 0);

    // 4. Filtrar muestras por rangos de fecha
    // 'fechaRegistro' es un timestamp (número), por lo que podemos comparar directamente.
    const muestrasHoy = muestras.filter(
      (m) => m.fechaRegistro >= startOfDay
    ).length;
    
    const muestrasSemana = muestras.filter(
      (m) => m.fechaRegistro >= startOfWeek
    ).length;
    
    const muestrasMes = muestras.filter(
      (m) => m.fechaRegistro >= startOfMonth
    ).length;
    
    const muestrasAno = muestras.filter(
      (m) => m.fechaRegistro >= startOfYear
    ).length;

    // 5. Devolver todas las estadísticas juntas
    return {
      totalClientes,
      muestrasSinResultados,
      muestrasHoy,
      muestrasSemana,
      muestrasMes,
      muestrasAno,
    };
  },
});