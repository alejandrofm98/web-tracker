export const TARGETS = [30, 15, 7, 1];

export function dueIn(days: number | null, targets: number[] = TARGETS): boolean {
  return days !== null && targets.includes(days);
}
