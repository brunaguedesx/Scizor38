import { describe, expect, it } from "vitest";
import { DEMO_RESERVATION_DURATION_SECONDS, demoAvailabilityDelayMs, effectiveStatus, formatRemaining, isActiveReservation, remainingMilliseconds, type Reservation } from "@/lib/reservations";

const reservation = (status: Reservation["status"], expiresAt: string) => ({ status, expires_at: expiresAt }) as Reservation;

describe("Regras de expiração e cancelamento", () => {
  const now = new Date("2026-11-14T12:00:00Z").getTime();

  it("uma reserva pendente expira exatamente no horário limite", () => {
    expect(effectiveStatus(reservation("PENDING", "2026-11-14T12:00:00Z"), now)).toBe("EXPIRED");
  });

  it("uma reserva confirmada também perde a validade sem reabrir o prazo", () => {
    expect(effectiveStatus(reservation("CONFIRMED", "2026-11-14T11:59:59Z"), now)).toBe("EXPIRED");
  });

  it("uma reserva recusada não muda de estado ao passar o horário", () => {
    expect(effectiveStatus(reservation("REJECTED", "2026-11-14T11:59:59Z"), now)).toBe("REJECTED");
  });

  it("a demonstração usa exatamente 20 segundos e exibe 00:00:20", () => {
    expect(DEMO_RESERVATION_DURATION_SECONDS).toBe(20);
    expect(formatRemaining("2026-11-14T12:00:20Z", now)).toBe("00:00:20");
  });

  it("duas horas continuam sendo exibidas como 02:00:00", () => {
    expect(formatRemaining("2026-11-14T14:00:00Z", now)).toBe("02:00:00");
  });

  it("reserva expirada não permanece ativa para cancelamento", () => {
    expect(isActiveReservation(reservation("PENDING", "2026-11-14T11:00:00Z"), now)).toBe(false);
    expect(remainingMilliseconds("2026-11-14T11:00:00Z", now)).toBe(0);
  });

  it("a notificação simulada espera no mínimo 5 e no máximo 20 segundos", () => {
    expect(demoAvailabilityDelayMs(0)).toBe(5_000);
    expect(demoAvailabilityDelayMs(0.5)).toBe(12_500);
    expect(demoAvailabilityDelayMs(1)).toBe(20_000);
  });
});
