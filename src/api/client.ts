/**
 * Mock transport. Every module's service goes through `request` so swapping in a real
 * HTTP client later is a single-file change — component and store contracts stay identical.
 */
const LATENCY_MS = 350;

export function request<T>(payload: T, latency = LATENCY_MS): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(payload), latency);
  });
}

export function requestFailure(message: string, latency = LATENCY_MS): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), latency);
  });
}

/** Deep clone so callers can never mutate the seed arrays by reference. */
export function clone<T>(value: T): T {
  return structuredClone(value);
}
