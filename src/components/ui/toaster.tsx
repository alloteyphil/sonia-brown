"use client";
import { Toaster as Sonner } from "sonner";

export { toast } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="top-center"
      closeButton
      richColors
      toastOptions={{
        classNames: {
          toast: "!rounded-2xl !border-horizon !font-sans !shadow-lg",
          title: "!font-semibold",
        },
      }}
    />
  );
}
