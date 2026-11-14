import type { Offer, Product, Store } from "@/lib/catalog";

export const DEMO_RESERVATION_DURATION_SECONDS = 20;

export type ReservationStatus = "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED" | "EXPIRED";

export interface ReservationItem {
  id: string;
  reservation_id: string;
  offer_id: string;
  selected_option: string | null;
  quantity: number;
  unit_price_cents_snapshot: number;
  offer: Offer & { product: Product };
}

export interface Reservation {
  id: string;
  group_id: string;
  store_id: string;
  customer_id: string;
  status: ReservationStatus;
  code: string;
  created_at: string;
  expires_at: string;
  decided_at: string | null;
  rejection_reason: string | null;
  store: Store;
  items: ReservationItem[];
  customer?: { display_name: string };
}

export interface CartItem {
  offerId: string;
  quantity: number;
  selectedOption: string;
}

export function effectiveStatus(reservation: Pick<Reservation, "status" | "expires_at">, now = Date.now()): ReservationStatus {
  if ((reservation.status === "PENDING" || reservation.status === "CONFIRMED") && new Date(reservation.expires_at).getTime() <= now) {
    return "EXPIRED";
  }
  return reservation.status;
}

export function remainingMilliseconds(expiresAt: string, now = Date.now()) {
  return Math.max(0, new Date(expiresAt).getTime() - now);
}

export function formatRemaining(expiresAt: string, now = Date.now()) {
  const totalSeconds = Math.floor(remainingMilliseconds(expiresAt, now) / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export const statusLabels: Record<ReservationStatus, string> = {
  PENDING: "Aguardando loja",
  CONFIRMED: "Confirmada",
  REJECTED: "Não confirmada",
  CANCELLED: "Cancelada",
  EXPIRED: "Expirada",
};

export function isActiveReservation(reservation: Reservation, now = Date.now()) {
  return ["PENDING", "CONFIRMED"].includes(effectiveStatus(reservation, now));
}

/** Random inclusive delay from 5 to 20 seconds for the explicitly simulated notification. */
export function demoAvailabilityDelayMs(random = Math.random()) {
  const normalized = Math.min(1, Math.max(0, random));
  return 5_000 + Math.round(normalized * 15_000);
}
