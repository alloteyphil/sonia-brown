import { cn } from "@/lib/utils";

export function StatusPage({
  code,
  title,
  body,
  actions,
  className,
}: {
  code?: string;
  title: string;
  body: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto flex max-w-lg flex-col items-center px-6 py-20 text-center", className)}>
      {code && <p className="font-mono text-sm font-semibold tracking-[0.3em] text-harbour">{code}</p>}
      <h1 className="mt-3 text-4xl sm:text-5xl">{title}</h1>
      <p className="mt-4 text-lg text-muted">{body}</p>
      {actions && <div className="mt-8 flex flex-wrap justify-center gap-3">{actions}</div>}
    </div>
  );
}
