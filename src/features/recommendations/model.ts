import type { Product } from "@/lib/catalog";

/** Content-based ranking, not a trained probability model. Reservations weigh more than favorites. */
export function rankBehavior(products: Product[], favoriteIds: string[], reservedIds: string[]) {
  const favorites = products.filter((product) => favoriteIds.includes(product.id));
  const reservations = products.filter((product) => reservedIds.includes(product.id));
  const excluded = new Set([...favoriteIds, ...reservedIds]);
  const signals = [...new Set([...favorites, ...reservations].map((product) => product.category))];
  const available = products
    .filter((product) => product.offers.some((offer) => offer.availability !== "UNAVAILABLE"))
    .map((product) => ({
      id: product.id,
      name: product.name,
      category: product.category,
      brand: product.brand,
      score:
        (favorites.some((favorite) => favorite.category === product.category) ? 3 : 0) +
        (reservations.some((reservation) => reservation.category === product.category) ? 5 : 0) +
        (favorites.some((favorite) => favorite.brand === product.brand) ? 1 : 0) +
        (reservations.some((reservation) => reservation.brand === product.brand) ? 2 : 0) +
        (product.offers.some((offer) => offer.original_price_cents !== null) ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  const newCandidates = available.filter((product) => !excluded.has(product.id));
  // Keep useful product cards when the customer has already favorited/reserved every new option.
  const candidates = (newCandidates.length > 0 ? newCandidates : available).slice(0, 6);

  return {
    hasSignals: favorites.length + reservations.length > 0,
    signals,
    favoriteCount: favorites.length,
    reservedCount: reservations.length,
    candidates,
  };
}
