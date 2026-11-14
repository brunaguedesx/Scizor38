import { createFileRoute, Link, Outlet, redirect, useLocation } from "@tanstack/react-router";
import { Gift, Home, Navigation, ShoppingBag, UserRound } from "lucide-react";
import { getCurrentProfile } from "@/features/auth/functions";
import { CartProvider, useCart } from "@/components/app/cart-context";
import { Brand } from "@/components/app/brand";
import { NotificationsPanel } from "@/components/app/notifications-panel";

export const Route = createFileRoute("/_authenticated/app")({
  loader: async () => {
    const profile = await getCurrentProfile();
    if (profile.role !== "CUSTOMER") throw redirect({ to: "/lojista" });
    return profile;
  },
  component: AppLayout,
});

const navigation = [
  { to: "/app" as const, label: "Descobrir", icon: Home },
  { to: "/app/reservas" as const, label: "Reservas", icon: ShoppingBag },
  { to: "/app/visita" as const, label: "Visita", icon: Navigation },
  { to: "/app/missoes" as const, label: "Missões", icon: Gift },
  { to: "/app/conta" as const, label: "Conta", icon: UserRound },
];

function AppLayout() {
  const profile = Route.useLoaderData();
  return (
    <CartProvider userId={profile.id}>
      <AppChrome name={profile.displayName} />
    </CartProvider>
  );
}

function AppChrome({ name }: { name: string }) {
  const location = useLocation();
  const { items } = useCart();
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-4 sm:px-8 lg:px-12">
          <Brand to="/app" />
          <nav className="hidden items-center gap-7 md:flex" aria-label="Área do cliente">
            {navigation.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/app" }}
                activeProps={{ className: "text-primary" }}
                className="text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-1">
            <NotificationsPanel />
            <span className="ml-1 hidden max-w-28 truncate px-3 text-xs font-medium text-muted-foreground sm:block">
              {name.split(" ")[0]}
            </span>
            <Link
              to="/app/reservas"
              className="relative ml-1 rounded-full p-2 text-foreground md:hidden"
              aria-label={`Reservas, ${items.length} itens selecionados`}
            >
              <ShoppingBag className="h-5 w-5" />
              {items.length > 0 && (
                <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[0.58rem] text-primary-foreground">
                  {items.length}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>
      <Outlet />
      <nav
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
        aria-label="Navegação móvel"
      >
        {navigation.map((item) => {
          const active =
            item.to === "/app"
              ? location.pathname === "/app"
              : location.pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex min-h-16 flex-col items-center justify-center gap-1 text-[0.62rem] font-medium ${active ? "text-primary" : "text-muted-foreground"}`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
              {item.to === "/app/reservas" && items.length > 0 && (
                <span className="absolute ml-7 -mt-7 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[0.55rem] text-primary-foreground">
                  {items.length}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
