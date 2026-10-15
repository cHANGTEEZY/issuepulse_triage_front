import { create } from "zustand";
import { USERS, type UserSortKey } from "@/features/users/data/users";
import { DEFAULT_FILTERS } from "@/features/users/lib/users";

type UsersState = {
  users: typeof USERS;
  sortBy: UserSortKey;
  role: string;
  status: string;
  search: string;
  selectedIds: string[];
  setSortBy: (sortBy: UserSortKey) => void;
  setRole: (role: string) => void;
  setStatus: (status: string) => void;
  setSearch: (search: string) => void;
  resetFilters: () => void;
  toggleSelected: (id: string) => void;
  setSelected: (ids: string[]) => void;
};

export const useUsersStore = create<UsersState>((set) => ({
  users: USERS,
  ...DEFAULT_FILTERS,
  selectedIds: [],
  setSortBy: (sortBy) => set({ sortBy }),
  setRole: (role) => set({ role }),
  setStatus: (status) => set({ status }),
  setSearch: (search) => set({ search }),
  resetFilters: () => set({ ...DEFAULT_FILTERS }),
  toggleSelected: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter((selected) => selected !== id)
        : [...state.selectedIds, id],
    })),
  setSelected: (selectedIds) => set({ selectedIds }),
}));
