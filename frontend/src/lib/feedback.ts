import { create } from 'zustand';

export type ToastTone = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  tone: ToastTone;
  message: string;
}

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'warning' | 'brand';
}

interface PendingConfirm extends ConfirmOptions {
  resolve: (accepted: boolean) => void;
}

interface FeedbackState {
  toasts: ToastItem[];
  confirmState: PendingConfirm | null;
  pushToast: (tone: ToastTone, message: string) => void;
  dismissToast: (id: string) => void;
  openConfirm: (options: ConfirmOptions) => Promise<boolean>;
  resolveConfirm: (accepted: boolean) => void;
}

const DEFAULT_DURATION: Record<ToastTone, number> = {
  success: 3800,
  info: 3800,
  warning: 4500,
  error: 5500,
};

export const useFeedbackStore = create<FeedbackState>((set, get) => ({
  toasts: [],
  confirmState: null,

  pushToast: (tone, message) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    set((state) => ({
      toasts: [...state.toasts.slice(-3), { id, tone, message }],
    }));
    if (typeof window !== 'undefined') {
      window.setTimeout(() => {
        get().dismissToast(id);
      }, DEFAULT_DURATION[tone]);
    }
  },

  dismissToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  openConfirm: (options) => {
    const existing = get().confirmState;
    if (existing) {
      existing.resolve(false);
    }
    return new Promise<boolean>((resolve) => {
      set({
        confirmState: {
          title: 'নিশ্চিতকরণ',
          confirmLabel: 'হ্যাঁ, নিশ্চিত',
          cancelLabel: 'বাতিল',
          tone: 'danger',
          ...options,
          resolve,
        },
      });
    });
  },

  resolveConfirm: (accepted) => {
    const current = get().confirmState;
    if (current) {
      current.resolve(accepted);
    }
    set({ confirmState: null });
  },
}));

export const toast = {
  success: (message: string) => useFeedbackStore.getState().pushToast('success', message),
  error: (message: string) => useFeedbackStore.getState().pushToast('error', message),
  warning: (message: string) => useFeedbackStore.getState().pushToast('warning', message),
  info: (message: string) => useFeedbackStore.getState().pushToast('info', message),
};

export function confirmAction(options: ConfirmOptions | string): Promise<boolean> {
  if (typeof options === 'string') {
    return useFeedbackStore.getState().openConfirm({ message: options });
  }
  return useFeedbackStore.getState().openConfirm(options);
}
