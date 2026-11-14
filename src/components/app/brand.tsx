import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Brand({ to = "/", className }: { to?: "/" | "/app" | "/lojista"; className?: string }) {
  return (
    <Link to={to} className={cn("focus-ring inline-flex flex-col leading-none", className)} aria-label="Capim Dourado Connect — início">
      <span className="font-display text-[1.45rem] font-semibold tracking-tight text-foreground">Capim Dourado</span>
      <span className="mt-1 text-[0.55rem] font-semibold uppercase tracking-[0.34em] text-primary">Connect</span>
    </Link>
  );
}
