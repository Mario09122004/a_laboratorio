/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as Auth from "../Auth.js";
import type * as analisis from "../analisis.js";
import type * as clientes from "../clientes.js";
import type * as dashboard from "../dashboard.js";
import type * as estadosMuestra from "../estadosMuestra.js";
import type * as http from "../http.js";
import type * as muestras from "../muestras.js";
import type * as notas from "../notas.js";
import type * as permissions from "../permissions.js";
import type * as roles from "../roles.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  Auth: typeof Auth;
  analisis: typeof analisis;
  clientes: typeof clientes;
  dashboard: typeof dashboard;
  estadosMuestra: typeof estadosMuestra;
  http: typeof http;
  muestras: typeof muestras;
  notas: typeof notas;
  permissions: typeof permissions;
  roles: typeof roles;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
