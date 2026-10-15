import { create } from "zustand";
import { COMPANIES, type Company, type SortKey } from "@/features/home/data/companies";
import { NOTIFICATIONS } from "@/features/home/data/notifications";
import { DEFAULT_FILTERS } from "@/features/home/lib/companies";

type CompaniesState = {
  companies: Company[];
  sortBy: SortKey;
  owner: string;
  stage: string;
  activityWindow: number;
  search: string;
  selectedIds: string[];
  detailId: string | null;
  detailOpen: boolean;
  profileName: string | null;
  profileOpen: boolean;
  newCompanyOpen: boolean;
  unreadNotificationIds: string[];
  activeTab: string;
  setSortBy: (sortBy: SortKey) => void;
  setOwner: (owner: string) => void;
  setStage: (stage: string) => void;
  setActivityWindow: (days: number) => void;
  setSearch: (search: string) => void;
  resetFilters: () => void;
  toggleSelected: (id: string) => void;
  setSelected: (ids: string[]) => void;
  openDetail: (id: string) => void;
  closeDetail: () => void;
  openProfile: (name: string) => void;
  closeProfile: () => void;
  setNewCompanyOpen: (open: boolean) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  setActiveTab: (tab: string) => void;
  addCompany: (company: Company) => void;
};

export const useCompaniesStore = create<CompaniesState>((set) => ({
  companies: COMPANIES,
  ...DEFAULT_FILTERS,
  selectedIds: ["microsoft"],
  detailId: null,
  detailOpen: false,
  profileName: null,
  profileOpen: false,
  newCompanyOpen: false,
  unreadNotificationIds: NOTIFICATIONS.filter((item) => item.unread).map(
    (item) => item.id,
  ),
  activeTab: "companies",
  setSortBy: (sortBy) => set({ sortBy }),
  setOwner: (owner) => set({ owner }),
  setStage: (stage) => set({ stage }),
  setActivityWindow: (activityWindow) => set({ activityWindow }),
  setSearch: (search) => set({ search }),
  resetFilters: () => set({ ...DEFAULT_FILTERS }),
  toggleSelected: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter((selected) => selected !== id)
        : [...state.selectedIds, id],
    })),
  setSelected: (selectedIds) => set({ selectedIds }),
  openDetail: (detailId) =>
    set({ detailId, detailOpen: true, profileOpen: false }),
  closeDetail: () => set({ detailOpen: false }),
  openProfile: (profileName) =>
    set({ profileName, profileOpen: true, detailOpen: false }),
  closeProfile: () => set({ profileOpen: false }),
  setNewCompanyOpen: (newCompanyOpen) => set({ newCompanyOpen }),
  markNotificationRead: (id) =>
    set((state) => ({
      unreadNotificationIds: state.unreadNotificationIds.filter(
        (unread) => unread !== id,
      ),
    })),
  markAllNotificationsRead: () => set({ unreadNotificationIds: [] }),
  setActiveTab: (activeTab) => set({ activeTab }),
  addCompany: (company) =>
    set((state) => ({
      companies: [company, ...state.companies],
      newCompanyOpen: false,
    })),
}));
