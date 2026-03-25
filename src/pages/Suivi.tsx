/**
 * CUSTOMER TRACKING PAGE (SUIVI)
 * This page allows customers to see the status of their orders and pressing requests.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/Context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionReveal from "@/components/SectionReveal";
import API_URL from "@/config";
import { Link, useNavigate } from "react-router-dom";
import {
    Package,
    Clock,
    CheckCircle2,
    ChevronRight,
    ShoppingBag,
    Droplets,
    Calendar,
    Truck,
    Factory,
    MapPin,
    Banknote,
    XCircle,
    Phone,
    AlertCircle,
    Search
} from "lucide-react";

// The different stages an order can be in
type OrderStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
// The different stages a pressing request can be in
type PressingStatus = 'pending' | 'accepted' | 'rejected' | 'completed';

interface OrderItem {
    olive_category_id?: any;
    pressing_service_id?: any;
    model_type?: 'OliveCategory' | 'Product';
    quantity: number;
    olive_price_at_order: number;
    pressing_fee_at_order: number;
    subtotal: number;
}

interface Order {
    _id: string;
    items: OrderItem[];
    shipping: {
        type: 'delivery' | 'pickup';
        wilaya?: string;
        cost: number;
        pickup_date?: string;
        pickup_range_start?: string;
        pickup_range_end?: string;
        pickup_hours?: string;
        pickup_status?: 'pending' | 'proposed' | 'accepted' | 'rejected' | 'collected';
    };
    total_price: number;
    tracking_code?: string;
    status: OrderStatus;
    created_at: string;
}

interface PressingRequest {
    _id: string;
    olive_quantity_kg: number;
    oil_quality: string;
    tracking_code?: string;
    yield: {
        liters_per_kg: number;
        produced_oil_liters: number;
    };
    payment: {
        type: 'money' | 'olives';
        pressing_price_per_kg?: number;
        percentage_taken?: number;
    };
    status: PressingStatus;
    created_at: string;
    bring_olives_date?: string;
    collect_oil_date?: string;
}

const Suivi = () => {
    const { t } = useTranslation();
    const { token, user } = useAuth();
    const navigate = useNavigate();

    // ==========================================
    // STATE
    // ==========================================
    const [activeTab, setActiveTab] = useState<"orders" | "pressing">("orders");
    const [orders, setOrders] = useState<Order[]>([]); // Current user's orders
    const [pressingRequests, setPressingRequests] = useState<PressingRequest[]>([]); // Current user's pressing requests
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [highlightedId, setHighlightedId] = useState<string | null>(null);

    /**
     * handleNotificationClick
     * This handles the logic when a user arrives from a notification link.
     * It automatically switches to the correct tab (Orders or Pressing),
     * highlights the specific row, and scrolls it into view.
     */
    const handleNotificationClick = (type: 'order' | 'pressing', id: string) => {
        if (type === 'order') {
            setActiveTab('orders');
        } else {
            setActiveTab('pressing');
        }
        setSearchTerm(id);
        setHighlightedId(id);

        // Clear the highlight effect after a few seconds
        setTimeout(() => {
            setHighlightedId(null);
        }, 8000);
    };

    /**
     * Scroll the highlighted item into view automatically.
     */
    useEffect(() => {
        if (highlightedId) {
            const timer = setTimeout(() => {
                const element = document.getElementById(`order-${highlightedId}`) || 
                                document.getElementById(`pressing-${highlightedId}`);
                
                if (element) {
                    element.scrollIntoView({ behavior: "smooth", block: "center" });
                }
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [highlightedId, activeTab]);

    /**
     * fetchData
     * Pulls all orders and pressing requests for the current user.
     */
    const fetchData = async () => {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
            const [ordersRes, pressingRes] = await Promise.all([
                fetch(`${API_URL}/orders/my`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${API_URL}/pressing/my`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            if (ordersRes.status === 429 || pressingRes.status === 429) {
                throw new Error("Trop de requêtes. Veuillez patienter.");
            }

            if (!ordersRes.ok || !pressingRes.ok) {
                throw new Error("Erreur lors du chargement de vos suivis.");
            }

            const [ordersData, pressingData] = await Promise.all([
                ordersRes.json(),
                pressingRes.json()
            ]);

            setOrders(ordersData);
            setPressingRequests(pressingData);
        } catch (err: any) {
            console.error("Suivi fetch error:", err);
            setError(err.message || "Erreur de chargement");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        // Handle URL parameters for deep linking
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab');
        const id = params.get('id');

        if (tab && (tab === 'orders' || tab === 'pressing')) {
            setActiveTab(tab);
        }

        if (id) {
            setSearchTerm(id);
            setHighlightedId(id);
            // Auto-clear highlight after 10 seconds
            setTimeout(() => {
                setHighlightedId(null);
            }, 10000);
        }
    }, [token]);

    const handlePickupAction = async (orderId: string, action: 'accept' | 'reject') => {
        try {
            const res = await fetch(`${API_URL}/orders/${orderId}/pickup/${action}`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const updatedOrder = await res.json();
                setOrders(prev => prev.map(o => o._id === orderId ? updatedOrder : o));
            }
        } catch (err) {
            console.error(`Error ${action}ing pickup:`, err);
        }
    };

    const getStatusIcon = (status: OrderStatus | PressingStatus) => {
        switch (status) {
            case 'pending': return <Clock className="w-5 h-5 text-amber-500" />;
            case 'confirmed':
            case 'accepted': return <CheckCircle2 className="w-5 h-5 text-blue-500" />;
            case 'completed': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case 'cancelled':
            case 'rejected': return <XCircle className="w-5 h-5 text-red-500" />;
            default: return <Clock className="w-5 h-5" />;
        }
    };

    const getStatusLabel = (status: OrderStatus | PressingStatus) => {
        const labels: Record<string, string> = {
            pending: t("suivi.status.pending"),
            confirmed: t("suivi.status.confirmed"),
            accepted: t("suivi.status.accepted"),
            completed: t("suivi.status.completed"),
            cancelled: t("suivi.status.cancelled"),
            rejected: t("suivi.status.rejected"),
        };
        return labels[status] || status;
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar onNotificationClick={handleNotificationClick} />

            <section className="pt-24 lg:pt-32 pb-20 px-6 lg:px-10 max-w-7xl mx-auto">
                <SectionReveal>
                    <span className="inline-block border border-foreground/20 rounded-full px-4 py-1.5 text-xs tracking-widest uppercase text-muted-foreground mb-6">
                        {t("suivi.badge")}
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        {t("suivi.title")}
                    </h1>
                    <p className="text-muted-foreground max-w-xl mb-10">
                        {t("suivi.desc")}
                    </p>
                </SectionReveal>

                {/* Tabs */}
                <div className="flex gap-4 mb-10 border-b border-foreground/10 pb-4">
                    <button
                        onClick={() => setActiveTab("orders")}
                        className={`flex items-center gap-2.5 pb-2 transition-all relative ${activeTab === 'orders' ? 'text-foreground font-bold' : 'text-muted-foreground'}`}
                    >
                        <ShoppingBag className="w-5 h-5" />
                        {t("suivi.tabs.orders")}
                        {activeTab === 'orders' && <motion.div layoutId="tab-underline" className="absolute bottom-[-17px] left-0 right-0 h-0.5 bg-primary" />}
                    </button>
                    <button
                        onClick={() => setActiveTab("pressing")}
                        className={`flex items-center gap-2.5 pb-2 transition-all relative ${activeTab === 'pressing' ? 'text-foreground font-bold' : 'text-muted-foreground'}`}
                    >
                        <Factory className="w-5 h-5" />
                        {t("suivi.tabs.pressing")}
                        {activeTab === 'pressing' && <motion.div layoutId="tab-underline" className="absolute bottom-[-17px] left-0 right-0 h-0.5 bg-primary" />}
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative w-full max-w-md mb-8">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder={t("suivi.search_placeholder") || "Rechercher par numéro..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoComplete="off"
                        className="w-full pl-11 pr-4 py-3 bg-secondary/30 border border-border/50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    />
                </div>

                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-20"
                        >
                            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            <p className="mt-4 text-muted-foreground">Chargement...</p>
                        </motion.div>
                    ) : error ? (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center py-32 bg-red-500/5 rounded-[40px] border border-red-500/10 max-w-2xl mx-auto border-dashed"
                        >
                            <AlertCircle className="w-16 h-16 text-red-500/30 mx-auto mb-6" />
                            <h3 className="text-xl font-bold mb-3">{error}</h3>
                            <button 
                                onClick={fetchData}
                                className="px-10 py-4 bg-primary text-white rounded-full font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
                            >
                                Réessayer le chargement
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            {activeTab === 'orders' ? (
                                <div className="space-y-6">
                                    {orders.length === 0 ? (
                                        <div className="text-center py-20 bg-secondary/30 rounded-3xl border border-dashed border-foreground/10">
                                            <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                                            <p className="text-muted-foreground">{t("suivi.empty_orders")}</p>
                                            <Link to="/boutique" className="mt-4 inline-block text-primary font-medium hover:underline">{t("suivi.shop_link")}</Link>
                                        </div>
                                    ) : (
                                        orders
                                        .filter(order => {
                                            const searchStr = `${order._id} ${order.tracking_code || ''} ${order.status}`.toLowerCase();
                                            return searchStr.includes(searchTerm.toLowerCase());
                                        })
                                        .map((order) => (
                                            <div 
                                                key={order._id} 
                                                id={`order-${order._id}`}
                                                className={`bg-secondary/30 border rounded-3xl p-6 lg:p-8 hover:bg-secondary/40 transition-all ${highlightedId === order._id ? 'ring-2 ring-primary border-primary shadow-lg shadow-primary/20 scale-[1.01]' : 'border-foreground/10'}`}
                                            >
                                                <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                                                    <div>
                                                        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">{t("suivi.order_num")}{order.tracking_code || order._id?.slice(-6).toUpperCase()}</p>
                                                        <h3 className="font-bold text-lg">{order.created_at ? new Date(order.created_at).toLocaleDateString() : "---"}</h3>
                                                    </div>
                                                    <div className="flex items-center gap-2 bg-background/50 px-4 py-2 rounded-full border border-foreground/5">
                                                        {getStatusIcon(order.status)}
                                                        <span className="text-sm font-semibold">{getStatusLabel(order.status)}</span>
                                                    </div>
                                                </div>

                                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                                    <div className="col-span-full border-t border-foreground/5 pt-6">
                                                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">{t("suivi.sections.items")}</p>
                                                        <div className="space-y-4">
                                                            {order.items.map((item, idx) => (
                                                                <div className="flex justify-between items-start text-sm py-1 border-b border-border/50 last:border-0 pb-3 last:pb-0" key={idx}>
                                                                    <div className="flex flex-col gap-0.5">
                                                                        <span className="font-bold text-foreground flex items-center gap-2">
                                                                            {item.olive_category_id?.name || item.pressing_service_id?.name || (item.olive_category_id ? `ID: ${item.olive_category_id}` : (item.pressing_service_id ? `ID: ${item.pressing_service_id}` : "Huile"))}
                                                                            {item.olive_category_id?.category && (
                                                                                <span className="text-[10px] font-black uppercase opacity-60 px-1.5 py-0.5 bg-primary/5 rounded border border-primary/10">
                                                                                    {t(`suivi.sections.categories.${item.olive_category_id.category}`)}
                                                                                </span>
                                                                            )}
                                                                        </span>
                                                                        <span className="text-xs text-muted-foreground">
                                                                            {item.quantity}{item.model_type === 'Product' || item.model_type === 'OliveCategory' ? 'L' : 'kg'} × {item.olive_price_at_order?.toLocaleString() || "0"} DA
                                                                        </span>
                                                                    </div>
                                                                    <span className="font-bold text-foreground">
                                                                        {item.subtotal?.toLocaleString() || "0"} DA
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="border-t border-foreground/5 pt-6">
                                                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">{t("suivi.sections.shipping")}</p>
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                                {order.shipping?.type === 'delivery' ? <Truck className="w-4 h-4 text-primary" /> : <MapPin className="w-4 h-4 text-primary" />}
                                                            </div>
                                                            <div className="text-sm">
                                                                <p className="font-semibold">{order.shipping?.type === 'delivery' ? t("suivi.shipping_types.delivery") : t("suivi.shipping_types.pickup")}</p>
                                                                <div className="text-muted-foreground">
                                                                    {order.shipping?.type === 'delivery' ? 
                                                                        (<div>
                                                                            <p className="text-xs">{t("boutique.form.wilaya")}: <span className="text-foreground font-medium">{order.shipping?.wilaya}</span></p>
                                                                            <p className="text-xs mt-1">{t("suivi.sections.shipping_cost")}: <span className="text-foreground font-medium">{order.shipping?.cost?.toLocaleString() || "0"} DA</span></p>
                                                                        </div>) : 
                                                                        (order.shipping?.pickup_range_start ? (
                                                                            <div className="flex flex-col gap-3 mt-1">
                                                                                <div className="flex flex-col gap-1">
                                                                                    <span className="text-primary font-bold text-xs">{t("suivi.pickup.available_from", { start: order.shipping.pickup_range_start ? new Date(order.shipping.pickup_range_start).toLocaleDateString() : '...', end: order.shipping.pickup_range_end ? new Date(order.shipping.pickup_range_end).toLocaleDateString() : '...' })}</span>
                                                                                    <span className="flex items-center gap-1.5 text-[10px]"><Clock className="w-3 h-3" /> {order.shipping.pickup_hours}</span>
                                                                                </div>
                                                                                
                                                                                {order.shipping.pickup_status === 'proposed' && (
                                                                                    <div className="flex gap-2">
                                                                                        <button 
                                                                                            onClick={() => handlePickupAction(order._id, 'accept')}
                                                                                            className="px-4 py-1.5 bg-green-500 text-white text-xs font-bold rounded-full hover:bg-green-600 transition-colors shadow-sm"
                                                                                        >
                                                                                            {t("suivi.pickup.btn_accept")}
                                                                                        </button>
                                                                                        <button 
                                                                                            onClick={() => handlePickupAction(order._id, 'reject')}
                                                                                            className="px-4 py-1.5 bg-red-500 text-white text-xs font-bold rounded-full hover:bg-red-600 transition-colors shadow-sm"
                                                                                        >
                                                                                            {t("suivi.pickup.btn_reject")}
                                                                                        </button>
                                                                                    </div>
                                                                                )}

                                                                                {order.shipping.pickup_status === 'accepted' && (
                                                                                    <span className="text-green-500 font-bold text-xs flex items-center gap-1">
                                                                                        <CheckCircle2 className="w-3 h-3" /> {t("suivi.pickup.status_accepted")}
                                                                                    </span>
                                                                                )}

                                                                                {order.shipping.pickup_status === 'rejected' && (
                                                                                    <span className="text-red-500 font-bold text-xs flex items-center gap-1">
                                                                                        <XCircle className="w-3 h-3" /> {t("suivi.pickup.status_rejected")}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        ) : (
                                                                            <span className="text-amber-500 font-medium italic text-xs">{t("suivi.pickup.pending")}</span>
                                                                        ))
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="border-t border-foreground/5 pt-6 ms-auto flex flex-col items-end w-full lg:w-fit">
                                                        <div className="space-y-1 w-full text-right mb-4">
                                                            <div className="flex justify-between lg:justify-end lg:gap-8 items-center text-sm text-muted-foreground">
                                                                <span className="text-[10px] font-bold uppercase tracking-widest">{t("suivi.sections.subtotal")}</span>
                                                                <span className="font-semibold">{((order.total_price || 0) - (order.shipping?.cost || 0)).toLocaleString()} DA</span>
                                                            </div>
                                                            {order.shipping.type === 'delivery' && (
                                                                <div className="flex justify-between lg:justify-end lg:gap-8 items-center text-sm text-muted-foreground">
                                                                    <span className="text-[10px] font-bold uppercase tracking-widest">{t("suivi.sections.shipping_cost")}</span>
                                                                    <span className="font-semibold">{order.shipping.cost.toLocaleString()} DA</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{t("suivi.sections.total")}</p>
                                                            <p className="text-4xl font-black text-primary leading-none">{order.total_price?.toLocaleString() || "0"} <span className="text-sm font-bold uppercase ml-1">DA</span></p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {pressingRequests.length === 0 ? (
                                        <div className="text-center py-20 bg-secondary/30 rounded-3xl border border-dashed border-foreground/10">
                                            <Factory className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                                            <p className="text-muted-foreground">{t("suivi.empty_pressing")}</p>
                                            <button onClick={() => navigate("/boutique")} className="mt-4 text-primary font-medium hover:underline">{t("suivi.shop_link")}</button>
                                        </div>
                                    ) : (
                                        pressingRequests
                                        .filter(req => {
                                            const searchStr = `${req._id} ${req.tracking_code || ''} ${req.status} ${req.oil_quality}`.toLowerCase();
                                            return searchStr.includes(searchTerm.toLowerCase());
                                        })
                                        .map((req) => (
                                            <div 
                                                key={req._id} 
                                                id={`pressing-${req._id}`}
                                                className={`bg-secondary/30 border rounded-3xl p-6 lg:p-8 hover:bg-secondary/40 transition-all ${highlightedId === req._id ? 'ring-2 ring-primary border-primary shadow-lg shadow-primary/20 scale-[1.01]' : 'border-foreground/10'}`}
                                            >
                                                <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                                                    <div>
                                                        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">{t("suivi.pressing_num")}{req.tracking_code || req._id?.slice(-6).toUpperCase()}</p>
                                                        <h3 className="font-bold text-lg">{req.created_at ? new Date(req.created_at).toLocaleDateString() : "---"}</h3>
                                                    </div>
                                                    <div className="flex items-center gap-2 bg-background/50 px-4 py-2 rounded-full border border-foreground/5">
                                                        {getStatusIcon(req.status)}
                                                        <span className="text-sm font-semibold">{getStatusLabel(req.status)}</span>
                                                    </div>
                                                </div>

                                                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                                                    <div>
                                                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">{t("suivi.sections.raw_material")}</p>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                                <Package className="w-4 h-4 text-primary" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold">{req.olive_quantity_kg} kg</p>
                                                                <p className="text-xs text-muted-foreground">Olives apportées</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">{t("suivi.sections.production")}</p>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                                <Droplets className="w-4 h-4 text-primary" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold">{req.yield?.produced_oil_liters?.toFixed(1) || "0.0"} L</p>
                                                                <p className="text-xs text-muted-foreground">Huile {req.oil_quality?.replace('_', ' ')}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Paiement</p>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                                {req.payment.type === 'money' ? <Banknote className="w-4 h-4 text-primary" /> : <Droplets className="w-4 h-4 text-green-600" />}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold">
                                                                    {req.payment?.type === 'money' ? `${(req.olive_quantity_kg * (req.payment?.pressing_price_per_kg || 0)).toLocaleString()} DA` : `${req.payment?.percentage_taken || 0}% d'huile`}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">Mode: {req.payment?.type === 'money' ? t("suivi.payment_types.money") : t("suivi.payment_types.percentage")}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {(req.bring_olives_date || req.collect_oil_date) && (
                                                        <div className="col-span-full border-t border-foreground/5 pt-4 mt-2">
                                                            <div className="flex flex-col gap-2">
                                                                <div className="flex items-center gap-2 text-primary font-medium text-sm">
                                                                    <Calendar className="w-4 h-4" />
                                                                    <span>Apport des olives : {req.bring_olives_date ? new Date(req.bring_olives_date).toLocaleDateString() : 'En attente'}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 text-primary/80 font-medium text-sm">
                                                                    <Droplets className="w-4 h-4" />
                                                                    <span>Récupération d'huile : {req.collect_oil_date ? new Date(req.collect_oil_date).toLocaleDateString() : 'En attente'}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="col-span-full mt-4 p-4 bg-primary/5 border border-primary/10 rounded-2xl">
                                                        <p className="text-sm text-primary flex items-center gap-2">
                                                            <Phone className="w-4 h-4" />
                                                            {t("suivi.pressing.contact_notice")}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>

            <Footer />
        </div>
    );
};

export default Suivi;
