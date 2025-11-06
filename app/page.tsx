"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { 
  Loader2, 
  Users, 
  FlaskConical, 
  AlertCircle, 
  CalendarDays, 
  CalendarClock, 
  Calendar1, 
  CalendarRange 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
}

function StatCard({ title, value, description, icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const stats = useQuery(api.dashboard.getDashboardStats);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  if (stats === undefined || !isLoaded) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const data = stats || {
    totalClientes: 0,
    muestrasSinResultados: 0,
    muestrasHoy: 0,
    muestrasSemana: 0,
    muestrasMes: 0,
    muestrasAno: 0,
  };

  return (
    <div className="container mx-auto py-8">
      {/* Mensaje de Bienvenida */}
      {user && (
        <h1 className="text-3xl font-bold tracking-tight mb-6">
          {getGreeting()}, {user.firstName}!
        </h1>
      )}

      {/* Estadísticas Principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <StatCard
          title="Total Clientes"
          value={data.totalClientes}
          icon={<Users className="h-4 w-4" />}
          description="Clientes registrados en el sistema."
        />
        <StatCard
          title="Muestras Pendientes"
          value={data.muestrasSinResultados}
          icon={<AlertCircle className="h-4 w-4 text-yellow-500" />}
          description="Muestras sin resultados cargados."
        />
        <StatCard
          title="Total de Muestras (Año)"
          value={data.muestrasAno}
          icon={<FlaskConical className="h-4 w-4 text-blue-500" />}
          description={`Total de muestras en ${new Date().getFullYear()}.`}
        />
      </div>

      {/* Estadísticas por Tiempo */}
      <h2 className="text-2xl font-semibold tracking-tight mb-4">Registros Recientes</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Hoy"
          value={data.muestrasHoy}
          icon={<CalendarDays className="h-4 w-4" />}
        />
        <StatCard
          title="Esta Semana"
          value={data.muestrasSemana}
          icon={<CalendarClock className="h-4 w-4" />}
        />
        <StatCard
          title="Este Mes"
          value={data.muestrasMes}
          icon={<Calendar1 className="h-4 w-4" />}
        />
        <StatCard
          title="Este Año"
          value={data.muestrasAno}
          icon={<CalendarRange className="h-4 w-4" />}
        />
      </div>
    </div>
  );
}