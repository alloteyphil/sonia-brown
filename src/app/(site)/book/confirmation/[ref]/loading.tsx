import { ActionSpinner } from "@/components/ui/spinner";

export default function ConfirmationLoading() {
  return (
    <section className="mx-auto max-w-3xl px-5 pt-12 sm:px-8 sm:pt-16">
      <ActionSpinner
        label="Loading your booking…"
        detail="If you just paid, we're confirming it with Paystack."
      />
    </section>
  );
}
