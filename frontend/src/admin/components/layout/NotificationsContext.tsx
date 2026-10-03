import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { getNotifications, markNotificationsRead } from "../../services/dashboardService";
import type { AdminNotification } from "../../types";

interface NotificationsContextType {
  notifications: AdminNotification[];
  unreadCount: number;
  loading: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
}

const NotificationsContext = createContext<NotificationsContextType | null>(null);

// Partagé entre l'en-tête (cloche) et la barre latérale (raccourci « Notifications »)
export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    getNotifications()
      .then(setNotifications)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)));
    markNotificationsRead([id]);
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((list) => {
      markNotificationsRead(list.filter((n) => !n.read).map((n) => n.id));
      return list.map((n) => ({ ...n, read: true }));
    });
  }, []);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount: notifications.filter((n) => !n.read).length,
        loading,
        open,
        setOpen,
        markAllRead,
        markRead,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) throw new Error("useNotifications doit être utilisé dans un NotificationsProvider");
  return context;
}
