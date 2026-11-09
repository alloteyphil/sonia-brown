import "server-only";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../convex/_generated/api";
import { fallbackBusiness, fallbackServices, type BusinessInfo, type PublicService } from "@/brand/content";

const configured = Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);

export async function getServices(): Promise<PublicService[]> {
  if (!configured) return fallbackServices;
  try {
    const rows = await fetchQuery(api.public.services, {});
    return rows.length ? rows : fallbackServices;
  } catch {
    return fallbackServices;
  }
}

export async function getBusinessInfo(): Promise<BusinessInfo> {
  if (!configured) return fallbackBusiness;
  try {
    return await fetchQuery(api.public.businessInfo, {});
  } catch {
    return fallbackBusiness;
  }
}

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}
