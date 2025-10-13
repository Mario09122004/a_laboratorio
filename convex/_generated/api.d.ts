/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as analisis from "../analisis.js";
import type * as clientes from "../clientes.js";
import type * as estadosMuestra from "../estadosMuestra.js";
import type * as http from "../http.js";
import type * as muestras from "../muestras.js";
import type * as notas from "../notas.js";
import type * as permissions from "../permissions.js";
import type * as roles from "../roles.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  analisis: typeof analisis;
  clientes: typeof clientes;
  estadosMuestra: typeof estadosMuestra;
  http: typeof http;
  muestras: typeof muestras;
  notas: typeof notas;
  permissions: typeof permissions;
  roles: typeof roles;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
