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

const getInitialAuthData = (): AuthData => {
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
  const [authData, setAuthData] = useState<AuthData>(getInitialAuthData);
  const [isLoading, setIsLoading] = useState(true);

  const { user, isLoaded: isClerkLoaded } = useUser();

  const permissionsQuery = useQuery(
    api.users.getUserRoleAndPermissions,
    user?.id ? { clerkId: user.id } : "skip"
  );

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
      
      setAuthData({ role: newRole, permissions: newPermissions });
      localStorage.setItem("userAuth", JSON.stringify({ role: newRole, permissions: newPermissions }));
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