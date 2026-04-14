import { toast, ToastOptions, ToastContent } from 'react-toastify';

const defaultOptions: ToastOptions = {
    position: 'top-right',
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: 'light',
};

/**
 * Helper to show a success toast notification.
 * @param message - The notification message
 * @param options - Optional toast configuration overrides
 */
export const showSuccess = (
    message: ToastContent,
    options?: ToastOptions,
) => toast.success(message, { ...defaultOptions, ...options });

/**
 * Helper to show an error toast notification.
 * @param message - The notification message
 * @param options - Optional toast configuration overrides
 */
export const showError = (
    message: ToastContent,
    options?: ToastOptions,
) => toast.error(message, { ...defaultOptions, ...options });

/**
 * Helper to show a warning toast notification.
 * @param message - The notification message
 * @param options - Optional toast configuration overrides
 */
export const showWarning = (
    message: ToastContent,
    options?: ToastOptions,
) => toast.warning(message, { ...defaultOptions, ...options });

/**
 * Helper to show an info toast notification.
 * @param message - The notification message
 * @param options - Optional toast configuration overrides
 */
export const showInfo = (
    message: ToastContent,
    options?: ToastOptions,
) => toast.info(message, { ...defaultOptions, ...options });

/**
 * Dismisses all active toasts.
 */
export const dismissAll = () => toast.dismiss();
