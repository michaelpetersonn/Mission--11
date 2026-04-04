import type { CartItem } from "./types";

export const CART_STORAGE_KEY = "mission12-cart";

export function readCartFromStorage(): CartItem[] {
  try {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    return storedCart ? JSON.parse(storedCart) : [];
  } catch {
    return [];
  }
}

export function formatCurrency(value: number): string {
  return Number(value).toFixed(2);
}
