/**
 * Returns the weight multiplier for a given weight option string.
 * Base price in products.ts is per 1 kg.
 *   "1 كج"  → 1.00
 *   "½ كج"  → 0.50
 *   "¼ كج"  → 0.25
 */
export function getWeightMultiplier(weight: string): number {
    if (weight.includes("¼")) return 0.25;
    if (weight.includes("½")) return 0.50;
    return 1; // default: 1 kg
}

/**
 * Returns the actual price for a cart item based on its weight selection.
 */
export function getItemPrice(basePrice: number, weight: string): number {
    return Math.round(basePrice * getWeightMultiplier(weight));
}
