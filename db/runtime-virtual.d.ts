declare module "@astrojs/db/dist/runtime/virtual.js" {
  export const NOW: unknown;

  export const column: {
    number: (options?: Record<string, unknown>) => unknown;
    boolean: (options?: Record<string, unknown>) => unknown;
    text: (options?: Record<string, unknown>) => unknown;
    date: (options?: Record<string, unknown>) => unknown;
    json: (options?: Record<string, unknown>) => unknown;
  };

  export function defineTable<T>(config: T): T;
  export function defineDb<T>(config: T): T;
}
