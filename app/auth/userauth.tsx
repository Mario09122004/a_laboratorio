"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

type AuthData = {
  role: string | null;
  permissions: string[];
};

type AuthorizationContextType = AuthData & {
  isLoading: boolean;
};

const getAuthDataFromStorage = (): AuthData => {
  if (typeof window === "undefined") {
    return { role: null, permissions: [] };
  }
  try {
    const item = localStorage.getItem("userAuth");
    if (item) {
      const data = JSON.parse(item);
      if (data.role && data.permissions) {
        return { role: data.role, permissions: data.permissions };
      }
    }
  } catch (error) {
    console.error("Error al leer 'userAuth' de localStorage", error);
  }
  return { role: null, permissions: [] };
};

const AuthorizationContext = createContext<AuthorizationContextType>({
  role: null,
  permissions: [],
  isLoading: true,
});

export const AuthorizationProvider = ({ children }: { children: ReactNode }) => {
  const [authData, setAuthData] = useState<AuthData>({ role: null, permissions: [] });
  
  const [isLoading, setIsLoading] = useState(true);
  const { user, isLoaded: isClerkLoaded } = useUser();

  useEffect(() => {
    const cachedData = getAuthDataFromStorage();
    if (cachedData.role) {
      setAuthData(cachedData);
    }
  }, []);


  const permissionsQuery = useQuery(
    api.users.getUserRoleAndPermissions,
    user?.id ? { clerkId: user.id } : "skip"
  );
  console.log("permissionsQuery", permissionsQuery);
  console.log("user", user?.id);

  useEffect(() => {
    if (!isClerkLoaded) {
      setIsLoading(true);
      return;
    }

    if (!user) {
      localStorage.removeItem("userAuth");
      setAuthData({ role: null, permissions: [] });
      setIsLoading(false);
      return;
    }

    if (permissionsQuery === undefined) {
      setIsLoading(true);
      return;
    }

    if (permissionsQuery) {
      const { roleName: newRole, permissions: newPermissions } = permissionsQuery;
      const newData = { role: newRole, permissions: newPermissions };
      
      setAuthData(newData);
      localStorage.setItem("userAuth", JSON.stringify(newData));
    } else {
      setAuthData({ role: null, permissions: [] });
      localStorage.removeItem("userAuth");
    }
    
    setIsLoading(false);
    
  }, [user, isClerkLoaded, permissionsQuery]);


  return (
    <AuthorizationContext.Provider 
      value={{ role: authData.role, permissions: authData.permissions, isLoading }}
    >
      {children}
    </AuthorizationContext.Provider>
  );
};

export const useAuthorization = () => {
  const context = useContext(AuthorizationContext);
  if (context === undefined) {
    throw new Error("useAuthorization must be used within an AuthorizationProvider");
  }
  return context;
};