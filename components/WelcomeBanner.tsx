"use client";

import { useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { useAuthorization } from "@/app/auth/userauth"; 

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 18) return "Buenas tardes";
  return "Buenas noches";
}

export function WelcomeBanner() {
  const { role: userRole, isLoading: isAuthLoading } = useAuthorization();
  
  const { user } = useUser();

  if (isAuthLoading) {
    return (
      <div className="h-[116px] mb-6 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const bannerClasses = "text-3xl font-bold tracking-tight mb-6 p-6 rounded-lg text-white shadow-md";

  return (
    (userRole && userRole !== "Sin rol asignado") ? (
      <h1 className={`${bannerClasses} bg-gradient-to-r from-blue-500 to-blue-700`}>
        {getGreeting()}, {user.firstName}!
        <span className="text-2xl font-medium opacity-80 ml-2">
          ({userRole})
        </span>
      </h1>
    ) : (
      <h1 className={`${bannerClasses} bg-gradient-to-r from-red-500 to-red-700`}>
        Rol no asignado. Por favor, comunícate con administración.
      </h1>
    )
  );
}