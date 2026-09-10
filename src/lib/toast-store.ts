import { create } from "zustand";

export interface Toast {
  id: number;
  /** Already translated: the caller knows the name of the thing. */
  message: string;
  action?: { label: string; to: string };
}

interface ToastState {
  toast: Toast | null;
  show: (toast: Omit<Toast, "id">) => void;
  dismiss: (id?: number) => void;
}

let nextId = 1;

/**
 * One short-lived message at a time. A new one replaces the old rather than
 * queueing: the second "added to your trip" in a row should update, not
 * wait its turn.
 */
export const useToastStore = create<ToastState>((set) => ({
  toast: null,
  show: (toast) => set({ toast: { ...toast, id: nextId++ } }),
  dismiss: (id) => set((state) => (id === undefined || state.toast?.id === id ? { toast: null } : state)),
}));
