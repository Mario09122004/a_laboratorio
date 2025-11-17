"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { PlusCircle, Trash2, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { withPermission } from "@/components/corrobradorpermiso";
import { PageSkeleton } from "@/components/loader";

// --- Componente para la lista de usuarios y asignación de roles ---
function UserList({ users, roles }: { users: (Doc<"Usuarios"> & { roleName: string })[], roles: Doc<"Roles">[] }) {
  const [filtroUsuario, setFiltroUsuario] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const assignRoleToUser = useMutation(api.users.assignRoleToUser);

  const handleRoleChange = (userId: Id<"Usuarios">, roleId: string) => {
    assignRoleToUser({ userId, roleId: roleId as Id<"Roles"> })
      .then(() => toast.success("Rol asignado correctamente."))
      .catch(() => toast.error("Error al asignar el rol."));
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      user.nombreCompleto.toLowerCase().includes(filtroUsuario.toLowerCase()) ||
      user.correo.toLowerCase().includes(filtroUsuario.toLowerCase())
    );
  }, [users, filtroUsuario]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usuarios</CardTitle>
        <CardDescription>Asigna roles a los usuarios del sistema.</CardDescription>
        <Input 
            placeholder="Buscar por nombre o correo..."
            value={filtroUsuario}
            onChange={(e) => {
                setFiltroUsuario(e.target.value);
                setCurrentPage(1); // Reset page on new search
            }}
            className="mt-2"
        />
      </CardHeader>
      <CardContent className="space-y-4">
        {paginatedUsers.map((user) => (
          <div key={user._id} className="flex items-center justify-between p-2 border rounded-md">
            <div>
              <p className="font-medium">{user.nombreCompleto}</p>
              <p className="text-sm text-muted-foreground">{user.correo}</p>
            </div>
            <Select onValueChange={(roleId) => handleRoleChange(user._id, roleId)} defaultValue={user.rol}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Asignar rol..." />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role._id} value={role._id}>{role.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
        <div className="flex justify-between items-center pt-4">
            <span className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages > 0 ? totalPages : 1}
            </span>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Anterior</Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0}>Siguiente</Button>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Componente para la gestión de roles y sus permisos ---
function RolesManager({ roles, permissions }: { roles: Doc<"Roles">[], permissions: Doc<"Permisos">[] }) {
  const [selectedRoleId, setSelectedRoleId] = useState<Id<"Roles"> | null>(null);
  const [newRoleName, setNewRoleName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filtroPermiso, setFiltroPermiso] = useState("");

  const roleDetails = useQuery(api.roles.getRoleWithPermissions, selectedRoleId ? { roleId: selectedRoleId } : "skip");
  const assignedPermissionIds = new Set(roleDetails?.permissions.map(p => p?._id));

  const createRole = useMutation(api.roles.createRole);
  const deleteRole = useMutation(api.roles.deleteRole);
  const assignPermission = useMutation(api.roles.assignPermissionToRole);
  const removePermission = useMutation(api.roles.removePermissionFromRole);

  const filteredPermissions = useMemo(() => {
    return permissions.filter(p => p.nombre.toLowerCase().includes(filtroPermiso.toLowerCase()));
  }, [permissions, filtroPermiso]);
  
  const handleCreateRole = () => {
    if (newRoleName.trim() === "") {
      toast.error("El nombre del rol no puede estar vacío.");
      return;
    }
    createRole({ nombre: newRoleName })
      .then(() => {
        toast.success(`Rol "${newRoleName}" creado.`);
        setNewRoleName("");
        setIsDialogOpen(false);
      })
      .catch(() => toast.error("Error al crear el rol."));
  };
  
  const handleDeleteRole = (roleId: Id<"Roles">) => {
    deleteRole({ roleId })
      .then(() => {
        toast.info("Rol eliminado.");
        if (selectedRoleId === roleId) {
          setSelectedRoleId(null);
        }
      })
      .catch(() => toast.error("Error al eliminar el rol."));
  }

  const handlePermissionChange = (permisoId: Id<"Permisos">, isChecked: boolean) => {
    if (!selectedRoleId) return;
    const mutation = isChecked ? assignPermission : removePermission;
    mutation({ rolId: selectedRoleId, permisoId });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Roles y Permisos</CardTitle>
        <CardDescription>Crea roles y asígnales permisos específicos.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full mb-4">
                <PlusCircle className="mr-2 h-4 w-4" /> Crear Nuevo Rol
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Crear Rol</DialogTitle></DialogHeader>
              <Input value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} placeholder="Nombre del rol (ej: Administrador)" />
              <DialogFooter><Button onClick={handleCreateRole}>Guardar</Button></DialogFooter>
            </DialogContent>
          </Dialog>

          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Roles Existentes</h3>
            {roles.map((role) => (
              <div
                key={role._id}
                className={`flex items-center justify-between p-2 border rounded-md cursor-pointer ${selectedRoleId === role._id ? 'bg-muted' : ''}`}
                onClick={() => setSelectedRoleId(role._id)}
              >
                <span>{role.nombre}</span>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={(e) => e.stopPropagation()}>
                        <Trash2 className="h-4 w-4"/>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>¿Estás seguro?</AlertDialogTitle><AlertDialogDescription>Esta acción eliminará el rol y desasignará los permisos asociados.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteRole(role._id)}>Eliminar</AlertDialogAction></AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-sm mb-2">Permisos para: <span className="text-primary">{roleDetails?.nombre ?? "..."}</span></h3>
          {selectedRoleId ? (
            <TooltipProvider>
              <Input 
                  placeholder="Buscar permiso..."
                  value={filtroPermiso}
                  onChange={(e) => setFiltroPermiso(e.target.value)}
                  className="mb-4"
              />
              <div className="space-y-3 max-h-60 overflow-y-auto">
              {filteredPermissions.map((permission) => (
                  <div key={permission._id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                          id={permission._id}
                          checked={assignedPermissionIds.has(permission._id)}
                          onCheckedChange={(checked) => handlePermissionChange(permission._id, !!checked)}
                      />
                      <label htmlFor={permission._id} className="text-sm font-medium leading-none cursor-pointer">
                          {permission.nombre}
                      </label>
                    </div>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{permission.descripcion}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
              ))}
              {roleDetails === undefined && <p className="text-sm text-muted-foreground">Cargando permisos...</p>}
              </div>
            </TooltipProvider>
          ) : (
            <p className="text-sm text-muted-foreground">Selecciona un rol para ver y asignar permisos.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function RolesPermisosPage() {
  const users = useQuery(api.users.getUsers);
  const roles = useQuery(api.roles.getRoles);
  const permissions = useQuery(api.permissions.getPermissions);

  const isLoading = !users || !roles || !permissions;

  if (isLoading) {
    return (
      <PageSkeleton />
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <UserList users={users} roles={roles} />
        <RolesManager roles={roles} permissions={permissions} />
      </div>
    </div>
  );
}

export default withPermission(
  RolesPermisosPage,
  "VerRolesYPermisos",
);