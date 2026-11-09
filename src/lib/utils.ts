import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function errorMessage(e: unknown): string {
  if (e && typeof e === "object" && "data" in e && typeof (e as { data: unknown }).data === "string") {
    return (e as { data: string }).data;
  }
  if (e instanceof Error) {
    // Convex wraps server errors; show only the human part.
    const m = e.message.match(/Uncaught (?:ConvexError|Error): (.*?)(?:\n|$)/);
    return m ? m[1] : e.message;
  }
  return "Something went wrong. Please try again.";
}

export function whatsappLink(number: string, text?: string) {
  const n = number.replace(/[^0-9]/g, "");
  return `https://wa.me/${n}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}
