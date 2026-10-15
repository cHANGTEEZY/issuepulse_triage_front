export function matchesQuery(query: string, ...fields: Array<string | number>) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return fields.some((field) => String(field).toLowerCase().includes(needle));
}
