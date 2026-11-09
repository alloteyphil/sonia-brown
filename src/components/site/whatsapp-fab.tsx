"use client";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/utils";

/** Floating "Chat on WhatsApp" button. Hidden on /book, which has its own WhatsApp link. */
export function WhatsAppFab({ number }: { number: string }) {
  const pathname = usePathname();
  if (pathname.startsWith("/book")) return null;
  return (
    <a
      href={whatsappLink(number, "Hi Sonia, I'd like to ask about booking.")}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 z-40 inline-flex h-12 items-center gap-2 rounded-full bg-[#1f8a5a] px-3.5 font-medium text-white shadow-[0_8px_24px_rgba(11,34,57,0.18)] transition-colors duration-150 hover:bg-[#18724a] sm:bottom-6 sm:right-6 sm:px-5"
    >
      <MessageCircle className="size-5" strokeWidth={1.5} aria-hidden />
      <span className="sr-only sm:not-sr-only">Chat on WhatsApp</span>
    </a>
  );
}
