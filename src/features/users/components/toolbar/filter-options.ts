import {
  ROLES,
  SORT_OPTIONS,
  STATUSES,
} from "@/features/users/data/users";
import { ALL_ROLES, ALL_STATUSES } from "@/features/users/lib/users";

export const ROLE_OPTIONS = [
  { value: ALL_ROLES, label: "All Roles" },
  ...ROLES.map((role) => ({ value: role, label: role })),
];

export const STATUS_OPTIONS = [
  { value: ALL_STATUSES, label: "All Statuses" },
  ...STATUSES.map((status) => ({ value: status, label: status })),
];

export const SORT_MENU_OPTIONS = SORT_OPTIONS.map((option) => ({
  value: option.value,
  label: option.label,
}));
