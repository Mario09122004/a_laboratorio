"use client";
 
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, type ComponentType } from "react";
import { ShieldAlert } from "lucide-react";
import { PageSkeleton } from "@/components/loader";
 
function AccessDenied() {
  const router = useRouter();
 
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/');
    }, 3000);
    return () => clearTimeout(timer);
  }, [router]);
 
  return (
    <div className="flex flex-col justify-center items-center h-full text-center p-8">
      <ShieldAlert className="size-16 text-destructive mb-4" />
      <h1 className="text-2xl font-bold text-destructive">Acceso Denegado</h1>
      <p className="text-muted-foreground mt-2">No tienes los permisos necesarios para ver esta página.</p>
      <p className="text-sm text-muted-foreground mt-1">Serás redirigido a la página de inicio...</p>
    </div>
  );
}
 
export function withPermission<P extends object>(
  WrappedComponent: ComponentType<P>,
  permissionName: string,
  LoadingComponent?: ComponentType
) {
  const WithPermissionComponent = (props: P) => {
    const { user, isLoaded: isUserLoaded } = useUser();
 
    const hasAccess = useQuery(
      api.Auth.hasPermission,
      user ? { clerkId: user.id, permissionName } : "skip"
    );
 
    if (!isUserLoaded || hasAccess === undefined) {
      return LoadingComponent ? <LoadingComponent /> : <PageSkeleton />;
    }
 
    if (hasAccess === false) {
      return <AccessDenied />;
    }
 
    return <WrappedComponent {...props} />;
  };
 
  WithPermissionComponent.displayName = `WithPermission(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
 
  return WithPermissionComponent;
}