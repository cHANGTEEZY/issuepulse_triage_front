import type { User } from "@/api/users";
import type { UserSortKey } from "@/features/users/data/users";
import { matchesQuery } from "@/lib/search";

export type UserFilters = {
  sortBy: UserSortKey;
  role: string;
  status: string;
  search: string;
};

export const TODAY = "2026-09-14";

export const ALL_ROLES = "all";
export const ALL_STATUSES = "all";

export const DEFAULT_FILTERS: UserFilters = {
  sortBy: "name",
  role: ALL_ROLES,
  status: ALL_STATUSES,
  search: "",
};

export function activeFilterCount({ role, status, search }: UserFilters) {
  return [
    role !== DEFAULT_FILTERS.role,
    status !== DEFAULT_FILTERS.status,
    search.trim().length > 0,
  ].filter(Boolean).length;
}

export function userFullName(user: User) {
  return `${user.firstName} ${user.lastName}`;
}

export function filterUsers(
  users: User[],
  { sortBy, role, status, search }: UserFilters,
): User[] {
  const filtered = users.filter((user) => {
    if (role !== ALL_ROLES && user.role !== role) return false;
    if (status !== ALL_STATUSES && user.status !== status) return false;
    return matchesQuery(
      search,
      userFullName(user),
      user.email,
      user.username,
      user.role,
      user.phone,
      user.status,
    );
  });

  return filtered.sort((a, b) => {
    switch (sortBy) {
      case "email":
        return a.email.localeCompare(b.email);
      case "role":
        return a.role.localeCompare(b.role);
      case "joinDate":
        return b.joinDate.localeCompare(a.joinDate);
      default:
        return userFullName(a).localeCompare(userFullName(b));
    }
  });
}

export function usersCsvRows(users: User[]) {
  return [
    [
      "Name",
      "Email",
      "Role",
      "Status",
      "Username",
      "Phone",
      "Join Date",
    ],
    ...users.map((user) => [
      userFullName(user),
      user.email,
      user.role,
      user.status,
      user.username,
      user.phone,
      user.joinDate,
    ]),
  ];
}

export function formatDate(iso: string) {
  const [, month, day] = iso.split("-").map(Number);
  const names = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${names[month - 1]} ${day}`;
}
