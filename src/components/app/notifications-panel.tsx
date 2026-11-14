import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Tag, CheckCheck } from "lucide-react";
import { getAccountData, markNotificationRead } from "@/features/account/functions";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function NotificationsPanel() {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ["account"], queryFn: () => getAccountData(), refetchInterval: 5_000 });
  const unread = data?.notifications.filter((item) => !item.read_at).length ?? 0;
  const mutation = useMutation({
    mutationFn: (id: string) => markNotificationRead({ data: { id } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["account"] }),
  });
  return (
    <Sheet>
      <SheetTrigger asChild><Button variant="ghost" size="icon" className="relative rounded-full" aria-label={`Notificações: ${unread} não lidas`}><Bell />{unread > 0 && <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[0.58rem] font-semibold text-primary-foreground">{unread}</span>}</Button></SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader><SheetTitle className="editorial-title text-3xl">Notificações</SheetTitle><SheetDescription>Alertas internos da demonstração, sem push externo. Confirmações automáticas são identificadas como simulação.</SheetDescription></SheetHeader>
        <div className="mt-6 space-y-3">
          {data?.notifications.length === 0 && <div className="rounded-lg bg-surface p-6 text-center text-sm text-muted-foreground">Nenhuma notificação por aqui.</div>}
          {data?.notifications.map((notification) => (
            <button key={notification.id} type="button" onClick={() => !notification.read_at && mutation.mutate(notification.id)} className={`focus-ring w-full rounded-lg border p-4 text-left ${notification.read_at ? "bg-background" : "border-primary/30 bg-gold-soft/45"}`}>
              <div className="flex gap-3"><span className="mt-0.5 text-primary">{notification.type === "PROMOTION" ? <Tag className="h-4 w-4" /> : <Bell className="h-4 w-4" />}</span><div><p className="text-sm font-medium">{notification.title}</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{notification.message}</p>{!notification.read_at && <span className="mt-3 flex items-center gap-1 text-[0.65rem] font-medium text-primary"><CheckCheck className="h-3 w-3" />Marcar como lida</span>}</div></div>
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
