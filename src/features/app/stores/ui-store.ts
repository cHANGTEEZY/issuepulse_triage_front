import { create } from "zustand";

type ToastState = {
  title: string;
  description?: string;
};

type UiState = {
  sidebarOpen: boolean;
  searchOpen: boolean;
  toast: ToastState | null;
  setSidebarOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  showToast: (toast: ToastState) => void;
  hideToast: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: false,
  searchOpen: false,
  toast: null,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  showToast: (toast) => set({ toast }),
  hideToast: () => set({ toast: null }),
}));
