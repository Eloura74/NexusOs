import React, { createContext, useContext, useState, useCallback } from "react";
import Toast, { ToastProps } from "../components/Toast";

interface NotificationContextType {
  showNotification: (
    type: ToastProps["type"],
    title: string,
    message: string,
    duration?: number,
  ) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider",
    );
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const showNotification = useCallback(
    (
      type: ToastProps["type"],
      title: string,
      message: string,
      duration = 5000,
    ) => {
      const id = Date.now().toString();
      setToasts((prev) => [
        ...prev,
        { id, type, title, message, duration, onClose: removeToast },
      ]);

      // Play sound if needed (optional)
      // const audio = new Audio('/notification.mp3');
      // audio.play().catch(e => console.log('Audio play failed', e));

      // Native Integration (if supported and allowed)
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, { body: message });
      } else if (
        "Notification" in window &&
        Notification.permission !== "denied"
      ) {
        Notification.requestPermission();
      }
    },
    [],
  );

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}

      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast {...toast} onClose={removeToast} />
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};
