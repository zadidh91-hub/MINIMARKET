export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function lineSubtotal(unitPrice: number, quantity: number): number {
  return roundMoney(unitPrice * quantity);
}

export function sumTotals(amounts: number[]): number {
  return roundMoney(amounts.reduce((acc, n) => acc + n, 0));
}
