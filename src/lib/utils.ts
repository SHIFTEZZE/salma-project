import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }
export function formatPrice(cents: number, currency: string = 'MAD') {
  return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: currency, minimumFractionDigits: 2 }).format(cents / 100);
}
