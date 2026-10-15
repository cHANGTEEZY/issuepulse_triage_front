export const TABLE_COLUMNS = [
  { key: "name", label: "Users", className: "justify-start" },
  { key: "email", label: "Email", className: "justify-start" },
  { key: "role", label: "Role", className: "justify-start" },
  { key: "status", label: "Status", className: "justify-start" },
  { key: "username", label: "Username", className: "justify-start" },
  { key: "phone", label: "Phone", className: "justify-start" },
  { key: "joined", label: "Joined", className: "justify-start" },
  { key: "action", label: "Action", className: "justify-center" },
] as const;

export type TableColumnKey = (typeof TABLE_COLUMNS)[number]["key"];

export const TABLE_GRID_CLASS =
  "grid min-w-max grid-cols-[repeat(8,max-content)] justify-between";

export const TABLE_ROW_CLASS = "col-span-full grid grid-cols-subgrid";

export const TABLE_CELL_CLASS = "flex items-center";

export function columnClass(key: TableColumnKey) {
  return TABLE_COLUMNS.find((column) => column.key === key)?.className ?? "";
}
