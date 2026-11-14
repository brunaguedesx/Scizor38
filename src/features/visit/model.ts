import type { Reservation } from "@/lib/reservations";
import { isActiveReservation } from "@/lib/reservations";

export const entrances = [
  { id: "norte", name: "Entrada Norte", node: 0 },
  { id: "sul", name: "Entrada Sul", node: 4 },
  { id: "leste", name: "Entrada Leste", node: 2 },
] as const;
export type Entrance = (typeof entrances)[number]["id"];
export function validEntrance(value: unknown): Entrance {
  return entrances.find((e) => e.id === value)?.id ?? "norte";
}
/** Fictional linear gallery: no geographic accuracy or physical navigation claim. */
const storeNodes: Record<string, number> = { movida: 1, essenza: 3, "casa-aurora": 5 };
export function buildVisit(reservations: Reservation[], entrance: Entrance, now = Date.now()) {
  const origin = entrances.find((e) => e.id === entrance)?.node ?? 0;
  const unique = new Map(
    reservations
      .filter((r) => isActiveReservation(r, now))
      .map((r) => [
        r.store_id,
        { ...r.store, code: r.code, status: r.status, node: storeNodes[r.store_id] ?? 2 },
      ]),
  );
  let current: number = origin;
  const remaining = [...unique.values()];
  const route: ((typeof remaining)[number] & { minutes: number })[] = [];
  while (remaining.length) {
    remaining.sort((a, b) => Math.abs(a.node - current) - Math.abs(b.node - current));
    const next = remaining.shift();
    if (!next) break;
    route.push({ ...next, minutes: Math.max(1, Math.abs(next.node - current) * 2) });
    current = next.node;
  }
  return route;
}
