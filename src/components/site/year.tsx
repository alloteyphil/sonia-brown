/** Copyright year. suppressHydrationWarning covers rare year-boundary mismatches. */
export function Year() {
  return <span suppressHydrationWarning>{new Date().getFullYear()}</span>;
}
