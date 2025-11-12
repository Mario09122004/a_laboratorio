"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { User, TestTubes, TestTubeDiagonal, LogOut, KeyRound } from "lucide-react"
import { useUser, useClerk } from "@clerk/nextjs"
import { useAuthorization } from "@/app/auth/userauth"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { hasPermission } from "@/lib/utils"

const items = [
  // ... (tu lista de items se queda igual)
  {
    title: "Muestras",
    url: "/muestras",
    icon: TestTubes,
    permission: "VerMuestras",
  },
  {
    title: "Clientes",
    url: "/clientes",
    icon: User,
    permission: "VerClientes",
  },
  {
    title: "Análisis",
    url: "/analisis",
    icon: TestTubeDiagonal,
    permission: "VerAnalisis",
  },
  {
    title: "Estados de la muestra",
    url: "/estadosMuestra",
    icon: TestTubes,
    permission: "VerEstados",
  },
  {
    title: "Administracion de usuarios",
    url: "/rolypermisos",
    icon: KeyRound,
    permission: "VerRolesYPermisos",
  },
]

export function AppSidebar() {
  const { user, isLoaded: isClerkLoaded } = useUser() 
  const { signOut } = useClerk()
  const { isLoading: isAuthLoading } = useAuthorization();
  
  const [isClient, setIsClient] = useState(false); 

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <Sidebar className="flex flex-col justify-between">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <Link href="/" className="px-3 text-sm font-semibold text-muted-foreground no-underline">
              Aplicación
            </Link>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                isClient && isClerkLoaded && !isAuthLoading && hasPermission(item.permission) && (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url} className="flex items-center gap-2">
                        <item.icon className="w-5 h-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              ))}
              
              {isAuthLoading && (
                <div className="p-3 text-sm text-muted-foreground">
                  Cargando menú...
                </div>
              )}

            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <div className="p-4 border-t mt-auto flex items-center gap-3">
        {isClient && isClerkLoaded && user ? (
          <AlertDialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 w-full text-left">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.imageUrl} alt={user.fullName || "Usuario"} />
                    <AvatarFallback>{user.firstName?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.fullName}</p>
                  </div>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuLabel>Cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="text-red-600 focus:text-red-700 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </AlertDialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción cerrará tu sesión actual. Tendrás que volver a iniciar sesión para continuar.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => signOut()}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Cerrar Sesión
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <p className="text-sm text-muted-foreground">
            {!isClient || !isClerkLoaded ? "Cargando..." : "No ha iniciado sesión"}
          </p>
        )}
      </div>
      
    </Sidebar>
  )
}