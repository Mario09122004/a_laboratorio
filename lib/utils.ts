import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/////////////////////////////////////////////////////////////////
interface UserPermissions {
  roleName: string;
  permissions: string[];
}

function getUserPermissions(): UserPermissions | null {
  if (typeof window === "undefined") {
    return null;
  }
  
  // Se usa el string directamente
  const data = localStorage.getItem("userAuth");
  if (!data) {
    return null;
  }
  try {
    return JSON.parse(data) as UserPermissions;
  } catch (error) {
    console.error("Error al parsear los permisos del usuario:", error);
    return null;
  }
}

export function hasPermission(permissionName: string): boolean {
  const permissionsData = getUserPermissions();
  if (!permissionsData || !permissionsData.permissions) {
    return false;
  }
  return permissionsData.permissions.includes(permissionName);
}

export function getUserRole(): string | null {
  const permissionsData = getUserPermissions();
  return permissionsData?.roleName ?? null;
}


