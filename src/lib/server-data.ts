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

function cleanBusiness(info: BusinessInfo): BusinessInfo {
  return {
    ...info,
    serviceArea: info.serviceArea.trim(),
    phone: info.phone.trim(),
    email: info.email.trim(),
    whatsapp: info.whatsapp.trim(),
    instagram: info.instagram?.replace(/^@/, "").trim() || undefined,
  };
}

export async function getBusinessInfo(): Promise<BusinessInfo> {
  if (!configured) return cleanBusiness(fallbackBusiness);
  try {
    return cleanBusiness(await fetchQuery(api.public.businessInfo, {}));
  } catch {
    return cleanBusiness(fallbackBusiness);
  }
}

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}
