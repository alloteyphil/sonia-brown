/* eslint-disable */
  /**
   * Generated `api` utility.
   *
   * THIS CODE IS AUTOMATICALLY GENERATED.
   *
   * To regenerate, run `npx convex dev`.
   * @module
   */
  
  import type { ApiFromModules, FilterApi, FunctionReference } from "convex/server";
  import type * as admin from "../admin.js";
import type * as bookings from "../bookings.js";
import type * as crons from "../crons.js";
import type * as dashboard from "../dashboard.js";
import type * as emailTemplates from "../emailTemplates.js";
import type * as emails from "../emails.js";
import type * as http from "../http.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_money from "../lib/money.js";
import type * as lib_occupancy from "../lib/occupancy.js";
import type * as lib_rateLimit from "../lib/rateLimit.js";
import type * as lib_settings from "../lib/settings.js";
import type * as payments_paystack from "../payments/paystack.js";
import type * as payments_provider from "../payments/provider.js";
import type * as public_ from "../public.js";
import type * as seed from "../seed.js";
import type * as webhooks from "../webhooks.js";

  /**
   * A utility for referencing Convex functions in your app's API.
   *
   * Usage:
   * ```js
   * const myFunctionReference = api.myModule.myFunction;
   * ```
   */
  declare const fullApi: ApiFromModules<{
    "admin": typeof admin,
"bookings": typeof bookings,
"crons": typeof crons,
"dashboard": typeof dashboard,
"emailTemplates": typeof emailTemplates,
"emails": typeof emails,
"http": typeof http,
"lib/auth": typeof lib_auth,
"lib/money": typeof lib_money,
"lib/occupancy": typeof lib_occupancy,
"lib/rateLimit": typeof lib_rateLimit,
"lib/settings": typeof lib_settings,
"payments/paystack": typeof payments_paystack,
"payments/provider": typeof payments_provider,
"public": typeof public_,
"seed": typeof seed,
"webhooks": typeof webhooks,
  }>;
  export declare const api: FilterApi<typeof fullApi, FunctionReference<any, "public">>;
  export declare const internal: FilterApi<typeof fullApi, FunctionReference<any, "internal">>;
  