/** Resolves a path under `public/` against the configured Vite base. */
export function asset(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
}
