import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const showToast = useCallback(
    (message, type = "success", duration = 3000) => {
      setToast({ message, type });
      setTimeout(() => setToast(null), duration);
    },
    [],
  );
  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div
          className={`fixed top-4 right-4 px-4 py-2 rounded shadow-lg z-50 text-white ${toast.type === "error" ? "bg-red-500" : "bg-green-600"}`}
        >
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
