export function resolveReducedMotionPreference(
  value: boolean | null | undefined,
): boolean {
  return value ?? false;
}
