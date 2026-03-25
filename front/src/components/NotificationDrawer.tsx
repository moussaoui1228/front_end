/**
 * NOTIFICATION DRAWER
 * A sidebar that displays alerts for the user (orders, pressing, etc.).
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Check, Info, AlertTriangle } from "lucide-react";
import { useAuth } from "@/Context/AuthContext";
import { useTranslation } from "react-i18next";
import API_URL from "@/config";

interface Notification {
    _id: string;
    order_id?: string;
    pressing_id?: string;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
}

const NotificationDrawer = ({
    isOpen,
    onClose,
    onRefresh,
    unreadCount,
    setUnreadCount,
    onNotificationClick
}: {
    isOpen: boolean;
    onClose: () => void;
    onRefresh?: () => void | Promise<void>;
    unreadCount: number;
    setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
    onNotificationClick?: (type: 'order' | 'pressing', id: string) => void;
}) => {
    const { t } = useTranslation();
    const { token } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);

    // Fetch notifications whenever the drawer is opened
    useEffect(() => {
        if (isOpen && token) {
            fetchNotifications();
        }
    }, [isOpen, token]);

    /**
     * fetchNotifications
     * Gets the full list of notifications for the logged-in user.
     */
    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setNotifications(await res.json());
            }
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: string) => {
        // Optimistic update
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));

        try {
            const res = await fetch(`${API_URL}/notifications/${id}/read`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                if (onRefresh) onRefresh();
            } else {
                // Rollback on failure (simple version: fetch again)
                fetchNotifications();
                if (onRefresh) onRefresh();
            }
        } catch (err) {
            console.error("Failed to mark notification as read:", err);
            fetchNotifications();
        }
    };

    const markAllAsRead = async () => {
        // Optimistic update
        const countBefore = unreadCount;
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);

        try {
            const res = await fetch(`${API_URL}/notifications/read-all`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                if (onRefresh) onRefresh();
            } else {
                fetchNotifications();
                if (onRefresh) onRefresh();
            }
        } catch (err) {
            console.error("Failed to mark all as read:", err);
            fetchNotifications();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
                    />
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-background border-l border-border z-50 overflow-hidden flex flex-col"
                    >
                        <div className="p-6 border-b border-border flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Bell className="w-5 h-5 text-primary" />
                                <h3 className="font-bold">{t("notifications.title") || "Notifications"}</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-[10px] font-bold text-primary hover:bg-primary/10 px-2 py-1 rounded-lg transition-all border border-primary/20 uppercase tracking-tighter"
                                    >
                                        {t("notifications.mark_all") || "Tout marquer"}
                                    </button>
                                )}
                                <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {loading ? (
                                <div className="flex justify-center py-10">
                                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : notifications.length === 0 ? (
                                <p className="text-center text-muted-foreground py-10 text-sm">{t("notifications.empty") || "Aucune notification."}</p>
                            ) : (
                                notifications.map((n) => (
                                    <div
                                        key={n._id}
                                        onClick={() => {
                                            if (!n.is_read) markAsRead(n._id);
                                            if (onNotificationClick) {
                                                if (n.order_id) onNotificationClick('order', n.order_id);
                                                else if (n.pressing_id) onNotificationClick('pressing', n.pressing_id);
                                            }
                                            onClose();
                                        }}
                                        className={`p-4 rounded-2xl border transition-all cursor-pointer hover:border-primary/40 ${n.is_read ? "border-border bg-background" : "border-primary/20 bg-primary/5 shadow-sm"}`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className={`text-sm font-bold ${n.is_read ? "text-foreground" : "text-primary"}`}>{n.title}</h4>
                                            {!n.is_read && <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />}
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-relaxed mb-2">{n.message}</p>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                                            {new Date(n.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default NotificationDrawer;
