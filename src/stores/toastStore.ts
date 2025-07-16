import { create } from 'zustand';
import { ToastType } from '../components/common/Toast';

interface ToastState {
  visible: boolean;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastActions {
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  hideToast: () => void;
  showSuccessToast: (title: string, message?: string) => void;
  showErrorToast: (title: string, message?: string) => void;
  showInfoToast: (title: string, message?: string) => void;
}

export const useToastStore = create<ToastState & ToastActions>((set) => ({
  // Initial state
  visible: false,
  type: 'success',
  title: '',
  message: undefined,
  duration: 2000,

  // Actions
  showToast: (type, title, message, duration = 2000) => {
    set({
      visible: true,
      type,
      title,
      message,
      duration,
    });
  },

  hideToast: () => {
    set({
      visible: false,
    });
  },

  showSuccessToast: (title, message) => {
    set({
      visible: true,
      type: 'success',
      title,
      message,
      duration: 2000,
    });
  },

  showErrorToast: (title, message) => {
    set({
      visible: true,
      type: 'error',
      title,
      message,
      duration: 3000, // 에러 메시지는 조금 더 길게
    });
  },

  showInfoToast: (title, message) => {
    set({
      visible: true,
      type: 'info',
      title,
      message,
      duration: 2000,
    });
  },
}));