"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function AuthHandler() {
  const { user, isSignedIn } = useUser();

  const permissionsData = useQuery(
    api.users.getUserRoleAndPermissions,
    isSignedIn && user?.id ? { clerkId: user.id } : "skip"
  );

  useEffect(() => {
    if (!isSignedIn) {
      localStorage.removeItem("userPermissions");
      return;
    }

    if (permissionsData !== undefined && permissionsData !== null) {
      localStorage.setItem("userPermissions", JSON.stringify(permissionsData));
    }
    
  }, [isSignedIn, permissionsData]);

  return null;
}
