/**
 * ADMIN DASHBOARD
 * This is the control center for the owner of Thazdayth.
 * It allows managing products, orders, olive pressing requests, and users.
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next"; // Handes French/Kabyle/English translations
import { useAuth } from "@/Context/AuthContext"; // Manages user login state
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionReveal from "@/components/SectionReveal";
import API_URL from "@/config"; // The address of our backend server
import {
    LayoutDashboard,
    Package,
    ShoppingBag,
    Factory,
    Plus,
    Search,
    Edit2,
    Trash2,
    CheckCircle2,
    XCircle,
    Clock,
    Users as UsersIcon,
    User as UserIcon,
    ChevronRight,
    TrendingUp,
    Phone,
    MapPin,
    AlertCircle,
    ClipboardList,
    Save,
    Truck,
    Calendar,
    Archive
} from "lucide-react"; // Icon library
import { toast } from "sonner"; // Notification popups

// Definition of what a User looks like for the frontend
interface User {
    _id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address?: string;
    is_blacklisted: boolean;
    created_at: string;
}

const Dashboard = () => {
    const { t } = useTranslation();
    const { token, user } = useAuth();

    // ==========================================
    // STATE MANAGEMENT
    // These variables "remember" what is currently happening in the UI
    // ==========================================

    // Which tab is currently selected (Overview, Orders, etc.)
    const [activeTab, setActiveTab] = useState<"overview" | "products" | "orders" | "pressing" | "agenda" | "agenda_pressing" | "agenda_contacts" | "archive">("overview");
    
    // What the user is typing in the search bar
    const [searchTerm, setSearchTerm] = useState("");
    
    // Lists of data fetched from the backend
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false); // True while waiting for the server
    const [error, setError] = useState<string | null>(null);

    // Specific data for each section
    const [products, setProducts] = useState<any[]>([]); // Olive oil bottles for sale
    const [orders, setOrders] = useState<any[]>([]); // Customer purchases
    const [pressingRequests, setPressingRequests] = useState<any[]>([]); // Customers bringing olives
    const [oliveCategories, setOliveCategories] = useState<any[]>([]); // Types of olives (Extra virgin, etc.)
    const [pressingServices, setPressingServices] = useState<any[]>([]); // Costs for pressing
    const [archivedOrders, setArchivedOrders] = useState<any[]>([]);
    const [archivedPressing, setArchivedPressing] = useState<any[]>([]);
    const [globalSettings, setGlobalSettings] = useState<any>({ pressing_percentage_taken: 30 });
    
    // Used when clicking a notification to highlight a specific order/request
    const [highlightedId, setHighlightedId] = useState<string | null>(null);

    // ==========================================
    // INITIALIZATION
    // Code that runs when the page first loads
    // ==========================================

    useEffect(() => {
        if (token) {
            // Fetch everything we need from the server
            fetchAllData();
            
            // CHECK URL PARAMETERS
            // If the URL is "?tab=orders&id=123", we automatically go to the orders tab 
            // and highlight order #123.
            const params = new URLSearchParams(window.location.search);
            const tab = params.get('tab');
            const id = params.get('id');
            
            if (tab && ["overview", "products", "orders", "pressing", "agenda", "agenda_pressing", "agenda_contacts", "archive"].includes(tab)) {
                setActiveTab(tab as any);
            }
            
            if (id) {
                setHighlightedId(id);
                // Remove the highlight glow after 10 seconds
                setTimeout(() => setHighlightedId(null), 10000);
            }

            // Reset search when switching pages
            setSearchTerm("");
        }
    }, [token]);

    // Handle scrolling to highlighted element
    useEffect(() => {
        if (highlightedId) {
            // small delay to let the tab content render/filter
            const timer = setTimeout(() => {
                const element = document.getElementById(`order-${highlightedId}`) || 
                                document.getElementById(`pressing-${highlightedId}`) ||
                                document.getElementById(`agenda-order-${highlightedId}`) ||
                                document.getElementById(`agenda-pressing-${highlightedId}`);
                
                if (element) {
                    element.scrollIntoView({ behavior: "smooth", block: "center" });
                }
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [highlightedId, activeTab]);

    const fetchAllData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [prodRes, ordRes, pressRes, oliveRes, serviceRes, userRes, settingsRes] = await Promise.all([
                fetch(`${API_URL}/products`),
                fetch(`${API_URL}/orders`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_URL}/pressing`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_URL}/prices/olives`),
                fetch(`${API_URL}/prices/pressing`),
                fetch(`${API_URL}/users`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_URL}/settings`)
            ]);

            const checks = [
                { res: prodRes, name: "produits" },
                { res: ordRes, name: "commandes" },
                { res: pressRes, name: "triturations" },
                { res: oliveRes, name: "catégories" },
                { res: serviceRes, name: "services" },
                { res: userRes, name: "utilisateurs" },
                { res: settingsRes, name: "paramètres" }
            ];

            const failed = checks.filter(c => !c.res.ok);
            if (failed.length > 0) {
                if (failed.some(f => f.res.status === 429)) {
                    throw new Error("Trop de requêtes. Veuillez patienter un instant.");
                }
                throw new Error("Certaines données n'ont pas pu être chargées.");
            }

            const [prodData, ordData, pressData, oliveData, serviceData, userData, settingsData] = await Promise.all([
                prodRes.json(),
                ordRes.json(),
                pressRes.json(),
                oliveRes.json(),
                serviceRes.json(),
                userRes.json(),
                settingsRes.json()
            ]);

            setProducts(prodData);
            setOrders(ordData);
            setPressingRequests(pressData);
            setOliveCategories(oliveData);
            setPressingServices(serviceData);
            setAllUsers(userData);
            setGlobalSettings(settingsData);

            const [archOrdRes, archPressRes] = await Promise.all([
                fetch(`${API_URL}/orders/archived`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_URL}/pressing/archived`, { headers: { Authorization: `Bearer ${token}` } })
            ]);

            if (archOrdRes.ok) setArchivedOrders(await archOrdRes.json());
            if (archPressRes.ok) setArchivedPressing(await archPressRes.json());
        } catch (err: any) {
            console.error("Dashboard fetch error:", err);
            setError(err.message || "Erreur de chargement");
            toast.error(err.message || "Erreur lors du chargement des données");
        } finally {
            setLoading(false);
        }
    };

    const updatePrice = async (type: 'olives' | 'pressing', id: string, newPrice: number) => {
        try {
            const res = await fetch(`${API_URL}/prices/${type}/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(type === 'olives' ? { price_per_liter: newPrice } : { fee: newPrice })
            });

            if (res.ok) {
                toast.success("Prix mis à jour !");
                fetchAllData();
            } else {
                toast.error("Erreur lors de la mise à jour");
            }
        } catch (err) {
            toast.error("Erreur serveur");
        }
    };

    const updateCategory = async (id: string, newCategory: string) => {
        try {
            const res = await fetch(`${API_URL}/prices/pressing/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ category: newCategory })
            });

            if (res.ok) {
                toast.success("Catégorie mise à jour !");
                fetchAllData();
            } else {
                toast.error("Erreur lors de la mise à jour");
            }
        } catch (err) {
            toast.error("Erreur serveur");
        }
    };

    const updateOliveStock = async (id: string, newStock: number) => {
        try {
            const res = await fetch(`${API_URL}/prices/olives/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ stock_liters: newStock })
            });

            if (res.ok) {
                toast.success("Stock mis à jour !");
                fetchAllData();
            } else {
                toast.error("Erreur lors de la mise à jour du stock");
            }
        } catch (err) {
            toast.error("Erreur serveur");
        }
    };

    const updateProductField = async (id: string, field: string, value: any) => {
        if (value === undefined || value === null || (typeof value === 'string' && !value.trim())) return;
        try {
            const res = await fetch(`${API_URL}/products/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ [field]: value })
            });

            if (res.ok) {
                toast.success("Mise à jour effectuée !");
                fetchAllData();
            } else {
                toast.error("Erreur de mise à jour");
            }
        } catch (err) {
            toast.error("Erreur serveur");
        }
    };

    const updateName = async (type: 'olives' | 'pressing', id: string, newName: string) => {
        if (!newName.trim()) return;
        try {
            const res = await fetch(`${API_URL}/prices/${type}/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: newName })
            });

            if (res.ok) {
                toast.success("Nom mis à jour !");
                fetchAllData();
            } else {
                toast.error("Erreur lors de la mise à jour");
            }
        } catch (err) {
            toast.error("Erreur serveur");
        }
    };

    const updateYield = async (id: string, newYield: number) => {
        try {
            const res = await fetch(`${API_URL}/prices/pressing/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ yield_per_kg: newYield })
            });

            if (res.ok) {
                toast.success("Rendement mis à jour !");
                fetchAllData();
            } else {
                toast.error("Erreur lors de la mise à jour");
            }
        } catch (err) {
            toast.error("Erreur serveur");
        }
    };

    const updateGlobalSettings = async (newSettings: any) => {
        try {
            const res = await fetch(`${API_URL}/settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newSettings)
            });

            if (res.ok) {
                toast.success("Paramètres mis à jour !");
                fetchAllData();
            } else {
                toast.error("Erreur lors de la mise à jour");
            }
        } catch (err) {
            toast.error("Erreur serveur");
        }
    };

    const updateOrderStatus = async (id: string, status: string) => {
        try {
            const res = await fetch(`${API_URL}/orders/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });

            if (res.ok) {
                toast.success("Statut de la commande mis à jour !");
                fetchAllData();
            } else {
                toast.error("Erreur lors de la mise à jour du statut");
            }
        } catch (err) {
            toast.error("Erreur serveur");
        }
    };

    const [showPickupModal, setShowPickupModal] = useState(false);
    const [selectedOrderForPickup, setSelectedOrderForPickup] = useState<any>(null);
    const [pickupForm, setPickupForm] = useState({
        pickup_range_start: "",
        pickup_range_end: "",
        pickup_hours: "08:00 - 17:00"
    });

    const [showPressModal, setShowPressModal] = useState(false);
    const [selectedPressForSchedule, setSelectedPressForSchedule] = useState<any>(null);
    const [pressScheduleForm, setPressScheduleForm] = useState({
        bring_olives_date: "",
        collect_oil_date: ""
    });

    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [editingNoteType, setEditingNoteType] = useState<'order' | 'pressing' | null>(null);
    const [tempNoteValue, setTempNoteValue] = useState("");

    const updateNote = async (id: string, type: 'order' | 'pressing', notes: string) => {
        try {
            const endpoint = type === 'order' ? `${API_URL}/orders/${id}/notes` : `${API_URL}/pressing/${id}/notes`;
            const res = await fetch(endpoint, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ notes })
            });

            if (res.ok) {
                toast.success("Note mise à jour !");
                setEditingNoteId(null);
                fetchAllData();
            } else {
                const data = await res.json();
                toast.error(data.message || "Erreur lors de la mise à jour");
            }
        } catch (err) {
            toast.error("Erreur serveur");
        }
    };

    const toggleBlacklist = async (userId: string) => {
        try {
            const res = await fetch(`${API_URL}/users/${userId}/blacklist`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                toast.success(data.message);
                fetchAllData();
            } else {
                toast.error("Erreur lors de la modification du statut");
            }
        } catch (err) {
            toast.error("Erreur serveur");
        }
    };

    const handlePressScheduleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/pressing/${selectedPressForSchedule._id}/appointment`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    bring_olives_date: pressScheduleForm.bring_olives_date,
                    collect_oil_date: pressScheduleForm.collect_oil_date
                })
            });

            if (res.ok) {
                toast.success("Rendez-vous enregistré !");
                setShowPressModal(false);
                fetchAllData();
            } else {
                toast.error("Erreur lors de la programmation");
            }
        } catch (err) {
            toast.error("Erreur serveur");
        }
    };

    const [showNotesModal, setShowNotesModal] = useState(false);
    const [selectedItemForNotes, setSelectedItemForNotes] = useState<any>(null);
    const [notesType, setNotesType] = useState<'order' | 'pressing'>('order');
    const [notesForm, setNotesForm] = useState("");

    const handleNotesSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const endpoint = notesType === 'order' ? `orders/${selectedItemForNotes._id}/notes` : `pressing/${selectedItemForNotes._id}/notes`;
        try {
            const res = await fetch(`${API_URL}/${endpoint}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ notes: notesForm })
            });

            if (res.ok) {
                toast.success("Notes mises à jour !");
                setShowNotesModal(false);
                fetchAllData();
            } else {
                toast.error("Erreur lors de la mise à jour");
            }
        } catch (err) {
            toast.error("Erreur serveur");
        }
    };

    const handlePickupSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/orders/${selectedOrderForPickup._id}/pickup`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(pickupForm)
            });

            if (res.ok) {
                toast.success("Détails de récupération mis à jour !");
                setShowPickupModal(false);
                fetchAllData();
            } else {
                toast.error("Erreur lors de la mise à jour");
            }
        } catch (err) {
            toast.error("Erreur serveur");
        }
    };

    const updatePressingStatus = async (id: string, status: string) => {
        try {
            const res = await fetch(`${API_URL}/pressing/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });

            if (res.ok) {
                toast.success("Statut du pressage mis à jour !");
                fetchAllData();
            } else {
                toast.error("Erreur lors de la mise à jour du statut");
            }
        } catch (err) {
            toast.error("Erreur serveur");
        }
    };

    const markOrderAsCollected = async (id: string) => {
        try {
            const res = await fetch(`${API_URL}/orders/${id}/pickup/collect`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success("Commande marquée comme récupérée !");
                fetchAllData();
            } else {
                toast.error("Erreur lors de la mise à jour");
            }
        } catch (err) {
            toast.error("Erreur serveur");
        }
    };

    const archiveOrder = async (id: string) => {
        try {
            const res = await fetch(`${API_URL}/orders/${id}/archive`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success("Commande archivée !");
                fetchAllData();
            } else {
                toast.error("Erreur lors de l'archivage");
            }
        } catch (err) {
            toast.error("Erreur serveur");
        }
    };

    const deleteOrder = async (id: string) => {
        if (!confirm("Supprimer définitivement cette commande ?")) return;
        try {
            const res = await fetch(`${API_URL}/orders/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success("Commande supprimée !");
                fetchAllData();
            } else {
                toast.error("Erreur lors de la suppression");
            }
        } catch (err) {
            toast.error("Erreur serveur");
        }
    };

    const archivePressing = async (id: string) => {
        try {
            const res = await fetch(`${API_URL}/pressing/${id}/archive`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success("Demande archivée !");
                fetchAllData();
            } else {
                toast.error("Erreur lors de l'archivage");
            }
        } catch (err) {
            toast.error("Erreur serveur");
        }
    };

    const deletePressing = async (id: string) => {
        if (!confirm("Supprimer définitivement cette demande ?")) return;
        try {
            const res = await fetch(`${API_URL}/pressing/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success("Demande supprimée !");
                fetchAllData();
            } else {
                toast.error("Erreur lors de la suppression");
            }
        } catch (err) {
            toast.error("Erreur serveur");
        }
    };

    const handleProductSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const method = editingProduct ? 'PUT' : 'POST';
        const url = editingProduct ? `${API_URL}/products/${editingProduct._id}` : `${API_URL}/products`;

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(productForm)
            });

            if (res.ok) {
                toast.success(editingProduct ? "Produit mis à jour !" : "Produit créé !");
                setShowProductModal(false);
                setEditingProduct(null);
                setProductForm({ name: "", category: "extra_virgin", price_per_liter: 0, stock_liters: 0 });
                fetchAllData();
            } else {
                const data = await res.json();
                toast.error(data.message || "Erreur lors de l'opération");
            }
        } catch (err) {
            toast.error("Erreur serveur");
        }
    };

    const deleteProduct = async (id: string) => {
        if (!confirm("Supprimer ce produit ?")) return;
        try {
            const res = await fetch(`${API_URL}/products/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success("Produit supprimé !");
                fetchAllData();
            } else {
                toast.error("Erreur lors de la suppression");
            }
        } catch (err) {
            toast.error("Erreur serveur");
        }
    };

    const deleteOliveCategory = async (id: string) => {
        if (!confirm("Supprimer cette catégorie d'huile ?")) return;
        try {
            const res = await fetch(`${API_URL}/prices/olives/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success("Catégorie supprimée !");
                fetchAllData();
            } else {
                toast.error("Erreur lors de la suppression");
            }
        } catch (err) {
            toast.error("Erreur serveur");
        }
    };

    const deletePressingService = async (id: string) => {
        if (!confirm("Supprimer ce service de pressage ?")) return;
        try {
            const res = await fetch(`${API_URL}/prices/pressing/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success("Service supprimé !");
                fetchAllData();
            } else {
                toast.error("Erreur lors de la suppression");
            }
        } catch (err) {
            toast.error("Erreur serveur");
        }
    };

    const openCreateModal = () => {
        setEditingProduct(null);
        setProductForm({ name: "", category: "extra_virgin", price_per_liter: 0, stock_liters: 0 });
        setShowProductModal(true);
    };

    const openEditModal = (p: any) => {
        setEditingProduct(p);
        setProductForm({
            name: p.name,
            category: p.category,
            price_per_liter: p.price_per_liter,
            stock_liters: p.stock_liters
        });
        setShowProductModal(true);
    };

    const handleNotificationClick = (type: 'order' | 'pressing', id: string) => {
        // Precise tab targeting
        const isActiveOrder = orders.some(o => o._id === id);
        const isActivePressing = pressingRequests.some(r => r._id === id);
        const isArchivedOrder = archivedOrders.some(o => o._id === id);
        const isArchivedPressing = archivedPressing.some(r => r._id === id);

        if (isActiveOrder) {
            setActiveTab('orders');
        } else if (isActivePressing) {
            setActiveTab('pressing');
        } else if (isArchivedOrder || isArchivedPressing) {
            setActiveTab('archive');
        } else {
            // Default fallbacks
            if (type === 'order') {
                setActiveTab('orders');
            } else {
                setActiveTab('pressing');
            }
        }

        setSearchTerm(id);
        setHighlightedId(id);
        
        // Auto-clear highlight after 8 seconds (give more time for scrolling and visual check)
        setTimeout(() => {
            setHighlightedId(null);
        }, 8000);
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar onNotificationClick={handleNotificationClick} />

            <main className="pt-24 lg:pt-32 pb-20 px-6 lg:px-10 max-w-7xl mx-auto">
                <SectionReveal>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                        <div>
                            <span className="inline-block border border-primary/20 bg-primary/5 text-primary rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase mb-4">
                                Administration
                            </span>
                            <h1 className="text-4xl md:text-5xl font-bold">Tableau de Bord</h1>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={fetchAllData}
                                className="p-3 rounded-2xl bg-secondary hover:bg-secondary/80 transition-colors shadow-sm"
                                title="Rafraîchir"
                            >
                                <TrendingUp className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </SectionReveal>

                {/* Dash Tabs */}
                <div className="flex overflow-x-auto gap-2 mb-10 pb-2 scrollbar-hide border-b border-border/50">
                    {[
                        { id: "overview", label: t("dashboard.tabs.overview"), icon: LayoutDashboard },
                        { id: "products", label: t("dashboard.tabs.products"), icon: Package },
                        { id: "orders", label: t("dashboard.tabs.orders"), icon: ShoppingBag },
                        { id: "pressing", label: t("dashboard.tabs.pressing"), icon: Factory },
                        { id: "agenda", label: t("dashboard.tabs.agenda"), icon: ClipboardList },
                        { id: "agenda_pressing", label: t("dashboard.tabs.agenda_pressing"), icon: Calendar },
                        { id: "agenda_contacts", label: t("dashboard.tabs.agenda_contacts"), icon: UsersIcon },
                        { id: "archive", label: t("dashboard.tabs.archive"), icon: Archive },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2.5 px-6 py-3 rounded-t-2xl transition-all whitespace-nowrap relative ${activeTab === tab.id
                                ? "bg-primary/5 text-primary font-bold"
                                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                                }`}
                        >
                            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "animate-pulse" : ""}`} />
                            {tab.label}
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="active-tab"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                                />
                            )}
                        </button>
                    ))}
                </div>

                <AnimatePresence>
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }} 
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 text-red-500" />
                                <p className="text-sm font-medium text-red-600">{error}</p>
                            </div>
                            <button 
                                onClick={fetchAllData}
                                className="text-xs font-bold text-primary hover:underline bg-primary/5 px-4 py-2 rounded-full"
                            >
                                Réessayer
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-20"
                        >
                            <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            <p className="mt-4 text-muted-foreground font-medium">Chargement des données...</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        >
                            {activeTab === "overview" && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <StatCard title="Ventes Totales" value={`${orders.length}`} icon={ShoppingBag} color="text-blue-500" />
                                    <StatCard title="Produits" value={`${products.length}`} icon={Package} color="text-amber-500" />
                                    <StatCard title="Demandes Pressage" value={`${pressingRequests.length}`} icon={Factory} color="text-green-500" />
                                    <StatCard title="Clients" value={`${allUsers.length}`} icon={UsersIcon} color="text-purple-500" />

                                    <div className="col-span-full mt-6 bg-secondary/20 border border-border rounded-3xl p-8">
                                        <div className="flex items-center gap-3 mb-6">
                                            <AlertCircle className="w-6 h-6 text-primary" />
                                            <h2 className="text-xl font-bold">Actions Rapides</h2>
                                        </div>
                                        <p className="text-muted-foreground mb-8">Bienvenue sur votre espace de gestion. Utilisez les onglets ci-dessus pour gérer vos produits, suivre les commandes et organiser les rendez-vous de pressage.</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            <QuickActionButton onClick={() => setActiveTab("products")} label="Ajouter un produit" icon={Plus} />
                                            <QuickActionButton onClick={() => setActiveTab("orders")} label="Voir les commandes" icon={ShoppingBag} />
                                            <QuickActionButton onClick={() => setActiveTab("pressing")} label="Gérer le pressage" icon={Factory} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "products" && (
                                <div className="space-y-10">
                                    {/* Price Management Section */}
                                    <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8">
                                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                            <TrendingUp className="w-5 h-5 text-primary" />
                                            Gestion des Tarifs Dynamiques
                                        </h3>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                            {/* Olive Prices and Products */}
                                            <div>
                                                <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
                                                    <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Prix & Stock de l'Huile & Produits</h4>
                                                    <button
                                                        onClick={openCreateModal}
                                                        className="flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity font-bold text-xs shadow-sm"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                        Nouveau
                                                    </button>
                                                </div>
                                                <div className="space-y-3">
                                                    {oliveCategories.map(cat => (
                                                        <div key={cat._id} className="flex flex-col gap-3 p-4 bg-background border border-border rounded-2xl group relative overflow-hidden">
                                                            <div className="flex items-center justify-between gap-4">
                                                                <input
                                                                    type="text"
                                                                    defaultValue={cat.name}
                                                                    onBlur={(e) => updateName('olives', cat._id, e.target.value)}
                                                                    className="font-semibold bg-transparent border-none focus:ring-1 focus:ring-primary/20 rounded px-1 -ml-1 flex-1 outline-none relative z-10"
                                                                />
                                                                <div className="flex items-center gap-2 relative z-10">
                                                                    <div className="flex items-center gap-1">
                                                                        <input
                                                                            type="number"
                                                                            defaultValue={cat.price_per_liter}
                                                                            onBlur={(e) => updatePrice('olives', cat._id, parseFloat(e.target.value))}
                                                                            className="w-20 px-3 py-1.5 rounded-xl border border-border text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                                                                            placeholder="Prix"
                                                                        />
                                                                        <span className="text-[10px] font-bold text-muted-foreground uppercase flex-shrink-0">DA/L</span>
                                                                    </div>
                                                                    <div className="hidden sm:flex gap-1">
                                                                        <button onClick={() => deleteOliveCategory(cat._id)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors bg-background" title="Supprimer la catégorie">
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center justify-between pt-2 border-t border-border/50 relative z-10">
                                                                <span className="text-xs text-muted-foreground">Catégorie Olive</span>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="flex items-center gap-1">
                                                                        <input
                                                                            type="number"
                                                                            defaultValue={cat.stock_liters}
                                                                            onBlur={(e) => updateOliveStock(cat._id, parseFloat(e.target.value))}
                                                                            className={`w-20 px-3 py-1.5 rounded-xl border border-border text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none ${cat.stock_liters <= 10 ? "text-red-500" : "text-green-500"}`}
                                                                            placeholder="Stock"
                                                                        />
                                                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Litres</span>
                                                                    </div>
                                                                    <div className="flex sm:hidden gap-1">
                                                                        <button onClick={() => deleteOliveCategory(cat._id)} className="p-1.5 text-red-500/70 hover:text-red-500 transition-colors" title="Supprimer la catégorie">
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {products.map(p => (
                                                        <div key={p._id} className="flex flex-col gap-3 p-4 bg-background border border-border rounded-2xl group relative overflow-hidden">
                                                            <div className="flex items-center justify-between gap-4">
                                                                <input
                                                                    type="text"
                                                                    defaultValue={p.name}
                                                                    onBlur={(e) => updateProductField(p._id, 'name', e.target.value)}
                                                                    className="font-semibold text-primary bg-transparent border-none focus:ring-1 focus:ring-primary/20 rounded px-1 -ml-1 flex-1 outline-none relative z-10"
                                                                    title="Modifier le nom du produit"
                                                                />
                                                                <div className="flex items-center gap-2 relative z-10">
                                                                    <div className="flex items-center gap-1">
                                                                        <input
                                                                            type="number"
                                                                            defaultValue={p.price_per_liter}
                                                                            onBlur={(e) => updateProductField(p._id, 'price_per_liter', parseFloat(e.target.value))}
                                                                            className="w-20 px-3 py-1.5 rounded-xl border border-border text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                                                                            placeholder="Prix"
                                                                            title="Modifier le prix"
                                                                        />
                                                                        <span className="text-[10px] font-bold text-muted-foreground uppercase flex-shrink-0">DA/L</span>
                                                                    </div>
                                                                    <div className="hidden sm:flex gap-1">
                                                                        <button onClick={() => openEditModal(p)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors bg-background" title="Options de catégorie">
                                                                            <Edit2 className="w-4 h-4" />
                                                                        </button>
                                                                        <button onClick={() => deleteProduct(p._id)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors bg-background" title="Supprimer">
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center justify-between pt-2 border-t border-border/50 relative z-10">
                                                                <span className="text-xs font-medium text-muted-foreground">{p.category.replace('_', ' ')} (Produit)</span>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="flex items-center gap-1">
                                                                        <input
                                                                            type="number"
                                                                            defaultValue={p.stock_liters}
                                                                            onBlur={(e) => updateProductField(p._id, 'stock_liters', parseFloat(e.target.value))}
                                                                            className={`w-20 px-3 py-1.5 rounded-xl border border-border text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none ${p.stock_liters <= 10 ? "text-red-500" : "text-green-500"}`}
                                                                            placeholder="Stock"
                                                                            title="Modifier le stock"
                                                                        />
                                                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Litres</span>
                                                                    </div>
                                                                    <div className="flex sm:hidden gap-1">
                                                                        <button onClick={() => openEditModal(p)} className="p-1.5 text-muted-foreground hover:text-primary transition-colors" title="Options de catégorie">
                                                                            <Edit2 className="w-4 h-4" />
                                                                        </button>
                                                                        <button onClick={() => deleteProduct(p._id)} className="p-1.5 text-red-500/70 hover:text-red-500 transition-colors" title="Supprimer">
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Pressing Service Prices */}
                                            <div>
                                                <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Équipement & Frais de Pressage (DA/kg)</h4>
                                                <div className="space-y-4">
                                                    {pressingServices.map(svc => (
                                                        <div key={svc._id} className="p-5 bg-background border border-border rounded-2xl space-y-4">
                                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                                <div className="flex-1">
                                                                    <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">Nom de l'équipement</label>
                                                                    <div className="flex items-center gap-2">
                                                                        <input
                                                                            type="text"
                                                                            defaultValue={svc.name}
                                                                            onBlur={(e) => updateName('pressing', svc._id, e.target.value)}
                                                                            className="flex-1 font-semibold bg-transparent border-none focus:ring-1 focus:ring-primary/20 rounded px-1 -ml-1 outline-none text-sm"
                                                                        />
                                                                        <button 
                                                                            onClick={() => deletePressingService(svc._id)}
                                                                            className="p-1.5 rounded-lg text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors bg-background"
                                                                            title="Supprimer le service"
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                                <div className="w-full sm:w-32">
                                                                    <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">Frais (DA/kg)</label>
                                                                    <div className="flex items-center gap-2">
                                                                        <input
                                                                            type="number"
                                                                            defaultValue={svc.fee}
                                                                            onBlur={(e) => updatePrice('pressing', svc._id, parseFloat(e.target.value))}
                                                                            className="w-full px-3 py-1.5 rounded-xl border border-border text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                                                                        />
                                                                        <span className="text-xs font-bold text-muted-foreground">DA</span>
                                                                    </div>
                                                                </div>
                                                                <div className="w-full sm:w-32">
                                                                    <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">Rendement (L/kg)</label>
                                                                    <div className="flex items-center gap-2">
                                                                        <input
                                                                            type="number"
                                                                            step="0.01"
                                                                            defaultValue={svc.yield_per_kg || 0.2}
                                                                            onBlur={(e) => updateYield(svc._id, parseFloat(e.target.value))}
                                                                            className="w-full px-3 py-1.5 rounded-xl border border-border text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                                                                        />
                                                                        <span className="text-xs font-bold text-muted-foreground">L</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="pt-3 border-t border-border/50">
                                                                <label className="text-[10px] font-bold text-muted-foreground uppercase mb-2 block">Catégorie de qualité d'huile cible</label>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {[
                                                                        { id: 'extra_virgin', label: 'Extra Vierge' },
                                                                        { id: 'virgin', label: 'Vierge' },
                                                                        { id: 'third_quality', label: 'Courante' }
                                                                    ].map(cat => (
                                                                        <button
                                                                            key={cat.id}
                                                                            onClick={() => updateCategory(svc._id, cat.id)}
                                                                            className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-tighter transition-all border ${svc.category === cat.id
                                                                                ? "bg-primary text-primary-foreground border-primary"
                                                                                : "bg-secondary text-muted-foreground border-border hover:border-primary/40"
                                                                                }`}
                                                                        >
                                                                            {cat.label}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Global settings */}
                                                <div className="mt-10 p-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                                                    <h4 className="text-sm font-bold uppercase tracking-widest text-amber-700 mb-4 flex items-center gap-2">
                                                        <ClipboardList className="w-4 h-4" />
                                                        Paramètres Globaux du Service
                                                    </h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div>
                                                            <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">Pourcentage de prélèvement (%)</label>
                                                            <div className="flex items-center gap-3">
                                                                <input
                                                                    type="number"
                                                                    defaultValue={globalSettings.pressing_percentage_taken}
                                                                    onBlur={(e) => updateGlobalSettings({ pressing_percentage_taken: parseFloat(e.target.value) })}
                                                                    className="w-32 px-4 py-2 rounded-xl border border-border text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                                                                />
                                                                <span className="text-xs font-bold text-muted-foreground">% de l'huile produite</span>
                                                            </div>
                                                            <p className="text-[10px] text-muted-foreground mt-2 italic">C’est ce que vous retenez comme paiement si le client ne paye pas en argent.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Unified above */}
                                </div>
                            )}

                            {activeTab === "orders" && (
                                <div className="space-y-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                                        <h2 className="text-2xl font-bold">Suivi des Commandes</h2>
                                        <div className="relative w-full md:w-80">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <input
                                                type="text"
                                                placeholder="Rechercher une commande (ID, Nom, Tel)..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                autoComplete="off"
                                                className="w-full pl-11 pr-4 py-2.5 bg-secondary/30 border border-border/50 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-4">
                                        {orders
                                        .filter(o => {
                                            const searchStr = `${o._id} ${o.tracking_code || ''} ${o.user_id?.first_name} ${o.user_id?.last_name} ${o.user_id?.phone} ${o.user_id?.email}`.toLowerCase();
                                            return searchStr.includes(searchTerm.toLowerCase());
                                        })
                                        .map(o => (
                                            <div 
                                                key={o._id} 
                                                id={`order-${o._id}`}
                                                className={`bg-secondary/30 border p-6 rounded-3xl group hover:border-primary/20 transition-all ${highlightedId === o._id ? 'ring-2 ring-primary border-primary shadow-lg shadow-primary/20 scale-[1.01]' : 'border-border'}`}
                                            >
                                                <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                                                    <div>
                                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">Ref: #{o._id.slice(-6).toUpperCase()}</p>
                                                        <h4 className="font-bold text-lg flex items-center gap-2">
                                                            {o.user_id?.first_name} {o.user_id?.last_name}
                                                            {o.user_id?.is_blacklisted && (
                                                                <span className="px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[9px] font-black uppercase tracking-tighter flex items-center gap-1">
                                                                    <XCircle className="w-2.5 h-2.5" />
                                                                    {t("dashboard.common.blacklisted")}
                                                                </span>
                                                            )}
                                                        </h4>
                                                        <p className="text-xs text-muted-foreground mb-2">{new Date(o.created_at).toLocaleDateString()}</p>
                                                        <div className="text-[11px] text-muted-foreground bg-background/50 p-3 rounded-2xl mt-1 space-y-2 border border-border/10">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                                                    <UserIcon className="w-3 h-3" />
                                                                </div>
                                                                <span>{o.user_id?.email}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                                                    <Phone className="w-3 h-3" />
                                                                </div>
                                                                <a href={`tel:${o.user_id?.phone}`} className="hover:underline font-bold transition-all">{o.user_id?.phone}</a>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                                    <MapPin className="w-3 h-3" />
                                                                </div>
                                                                <span className="font-medium text-foreground">
                                                                    {o.shipping?.type === 'delivery' ?
                                                                        t("dashboard.orders.delivery_label", { address: o.shipping.wilaya || o.user_id?.address }) :
                                                                        t("dashboard.orders.pickup_label", { address: o.user_id?.address || "Bouira" })
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>
                                                        {o.items && o.items.length > 0 && (
                                                            <div className="mt-4 pt-4 border-t border-border/10 space-y-1">
                                                                {o.items.map((item: any, idx: number) => (
                                                                    <div key={idx} className="flex justify-between items-center text-[11px]">
                                                                        <span className="font-bold text-muted-foreground flex items-center gap-1.5">
                                                                            <Package className="w-3 h-3 text-primary" />
                                                                            {item.olive_category_id?.name || item.pressing_service_id?.name || (item.olive_category_id ? `[ID: ${item.olive_category_id}]` : (item.pressing_service_id ? `[ID: ${item.pressing_service_id}]` : "Produit"))}
                                                                            {item.olive_category_id?.category && (
                                                                                <span className="text-[9px] font-black uppercase opacity-60 ml-2 py-0.5 px-1.5 bg-primary/5 rounded-md border border-primary/10">
                                                                                    {t(`suivi.sections.categories.${item.olive_category_id.category}`)}
                                                                                </span>
                                                                            )}
                                                                        </span>
                                                                        <span className="bg-secondary/50 px-2 py-0.5 rounded-md font-black text-primary">
                                                                            x{item.quantity}{item.model_type === 'Product' || item.model_type === 'OliveCategory' ? 'L' : 'kg'}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                        <div className="mt-4">
                                                            {editingNoteId === o._id && editingNoteType === 'order' ? (
                                                                <div className="flex flex-col gap-2">
                                                                    <textarea
                                                                        value={tempNoteValue}
                                                                        onChange={(e) => setTempNoteValue(e.target.value)}
                                                                        autoFocus
                                                                        className="w-full bg-background border border-indigo-500/30 rounded-xl p-3 text-sm"
                                                                        rows={2}
                                                                        placeholder="Note privée pour cette commande..."
                                                                    />
                                                                    <div className="flex gap-2 justify-end">
                                                                        <button onClick={() => setEditingNoteId(null)} className="px-3 py-1.5 rounded-lg bg-secondary text-xs font-bold">Annuler</button>
                                                                        <button onClick={() => updateNote(o._id, 'order', tempNoteValue)} className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold flex items-center gap-1.5"><Save className="w-3.5 h-3.5" /> Enregistrer</button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div 
                                                                    onClick={() => {
                                                                        setEditingNoteId(o._id);
                                                                        setEditingNoteType('order');
                                                                        setTempNoteValue(o.owner_notes || "");
                                                                    }}
                                                                    className={`p-2 rounded-xl cursor-pointer transition-all border group relative
                                                                        ${o.owner_notes ? 'bg-indigo-500/5 border-indigo-500/20 text-indigo-700 italic' : 'bg-secondary/10 border-dashed border-border/50 text-muted-foreground hover:bg-secondary/20 h-8 flex items-center'}`}
                                                                >
                                                                    <span className="text-[10px] font-medium pr-8 uppercase">
                                                                        {o.owner_notes ? `Note: "${o.owner_notes}"` : "+ Note privée..."}
                                                                    </span>
                                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <Edit2 className="w-3 h-3 text-indigo-400" />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className={`px-4 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider shadow-sm 
                                                            ${o.status === 'completed' || o.status === 'delivered' ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                                                                o.status === 'pending' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                                                                    'bg-blue-500/10 border-blue-500/20 text-blue-500'}`}>
                                                             {o.status}
                                                         </span>
                                                         {o.shipping?.type === 'pickup' && o.shipping.pickup_status && (
                                                             <span className={`px-4 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider shadow-sm 
                                                                 ${o.shipping.pickup_status === 'accepted' ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                                                                     o.shipping.pickup_status === 'rejected' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                                                                         o.shipping.pickup_status === 'collected' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' :
                                                                             'bg-amber-500/10 border-amber-500/20 text-amber-500'}`}>
                                                                 {o.shipping.pickup_status}
                                                             </span>
                                                         )}
                                                     </div>
                                                </div>
                                                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                                                    <p className="text-sm font-medium">{t("dashboard.orders.total")}<span className="text-primary font-bold">{o.total_price.toLocaleString()} DA</span></p>
                                                    <div className="flex gap-2">
                                                        {o.shipping?.type === 'pickup' && (
                                                            <StatusBtn 
                                                                onClick={() => {
                                                                    setSelectedOrderForPickup(o);
                                                                    setPickupForm({
                                                                        pickup_range_start: o.shipping.pickup_range_start ? o.shipping.pickup_range_start.split('T')[0] : "",
                                                                        pickup_range_end: o.shipping.pickup_range_end ? o.shipping.pickup_range_end.split('T')[0] : "",
                                                                        pickup_hours: o.shipping.pickup_hours || "08:00 - 17:00"
                                                                    });
                                                                    setShowPickupModal(true);
                                                                }} 
                                                                 icon={Clock} 
                                                                 label={t("dashboard.orders.btn_schedule")} 
                                                                 color="text-amber-600" 
                                                             />
                                                         )}
                                                         <StatusBtn 
                                                             onClick={() => {
                                                                 setSelectedItemForNotes(o);
                                                                 setNotesType('order');
                                                                 setNotesForm(o.owner_notes || "");
                                                                 setShowNotesModal(true);
                                                             }} 
                                                             icon={Edit2} 
                                                             label={t("dashboard.notes.btn")} 
                                                             color="text-indigo-600" 
                                                         />
                                                         {o.shipping?.type === 'pickup' && o.shipping.pickup_status === 'accepted' && (
                                                             <StatusBtn 
                                                                 onClick={() => markOrderAsCollected(o._id)} 
                                                                 icon={Package} 
                                                                 label={t("dashboard.orders.btn_collect")} 
                                                                 color="text-green-600" 
                                                             />
                                                         )}
                                                        {o.status === 'pending' && <StatusBtn onClick={() => updateOrderStatus(o._id, 'in-progress')} icon={Clock} label={t("dashboard.status.in_progress")} color="text-blue-500" />}
                                                        {(o.status === 'pending' || o.status === 'in-progress') && <StatusBtn onClick={() => updateOrderStatus(o._id, 'delivered')} icon={CheckCircle2} label={t("dashboard.status.delivered")} color="text-green-500" />}
                                                        {['delivered', 'cancelled', 'completed'].includes(o.status) && <StatusBtn onClick={() => archiveOrder(o._id)} icon={Trash2} label={t("dashboard.status.archive")} color="text-muted-foreground" />}
                                                        <StatusBtn onClick={() => updateOrderStatus(o._id, 'cancelled')} icon={XCircle} label={t("dashboard.status.cancel")} color="text-red-500" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {orders.length === 0 && (
                                            <div className="text-center py-20 border border-dashed border-border rounded-3xl">
                                                <ShoppingBag className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                                                 <p className="text-muted-foreground">{t("dashboard.orders.empty")}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === "pressing" && (
                                <div className="space-y-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                                        <h2 className="text-2xl font-bold">Demandes de Pressage</h2>
                                        <div className="relative w-full md:w-80">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <input
                                                type="text"
                                                placeholder="Rechercher un pressage (ID, Nom, Tel)..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                autoComplete="off"
                                                className="w-full pl-11 pr-4 py-2.5 bg-secondary/30 border border-border/50 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-4">
                                        {pressingRequests
                                        .filter(r => {
                                            const searchStr = `${r._id} ${r.user_id?.first_name} ${r.user_id?.last_name} ${r.user_id?.phone} ${r.user_id?.email}`.toLowerCase();
                                            return searchStr.includes(searchTerm.toLowerCase());
                                        })
                                        .map(r => (
                                            <div 
                                                key={r._id} 
                                                id={`pressing-${r._id}`}
                                                className={`bg-secondary/30 border p-6 rounded-3xl group transition-all ${highlightedId === r._id ? 'ring-2 ring-primary border-primary shadow-lg shadow-primary/20 scale-[1.01]' : 'border-border'}`}
                                            >
                                                <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                                                    <div>
                                                        <h4 className="font-bold text-lg flex items-center gap-2">
                                                            {r.user_id?.first_name} {r.user_id?.last_name}
                                                            {r.user_id?.is_blacklisted && (
                                                                <span className="px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[9px] font-black uppercase tracking-tighter flex items-center gap-1">
                                                                    <XCircle className="w-2.5 h-2.5" />
                                                                    {t("dashboard.common.blacklisted")}
                                                                </span>
                                                            )}
                                                        </h4>
                                                        <div className="text-[11px] text-muted-foreground bg-background/50 p-3 rounded-2xl mt-2 space-y-2 border border-border/10">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                                                    <UserIcon className="w-3 h-3" />
                                                                </div>
                                                                <span>{r.user_id?.email}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                                                    <Phone className="w-3 h-3" />
                                                                </div>
                                                                <a href={`tel:${r.user_id?.phone}`} className="hover:underline font-bold transition-all">{r.user_id?.phone}</a>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                                    <MapPin className="w-3 h-3" />
                                                                </div>
                                                                <span>{r.user_id?.address || "Kabylie"}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-4">
                                                            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                                                                <Package className="w-4 h-4 text-primary" />
                                                            </div>
                                                            <p className="text-sm font-bold">{r.olive_quantity_kg} kg <span className="text-xs text-muted-foreground font-normal">Olives ({r.oil_quality})</span></p>
                                                        </div>
                                                        <div className="mt-4">
                                                            {editingNoteId === r._id && editingNoteType === 'pressing' ? (
                                                                <div className="flex flex-col gap-2">
                                                                    <textarea
                                                                        value={tempNoteValue}
                                                                        onChange={(e) => setTempNoteValue(e.target.value)}
                                                                        autoFocus
                                                                        className="w-full bg-background border border-indigo-500/30 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                                                        rows={2}
                                                                        placeholder="Note pour ce pressage..."
                                                                    />
                                                                    <div className="flex gap-2 justify-end">
                                                                        <button onClick={() => setEditingNoteId(null)} className="px-3 py-1.5 rounded-lg bg-secondary text-xs font-bold transition-colors">Annuler</button>
                                                                        <button onClick={() => updateNote(r._id, 'pressing', tempNoteValue)} className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors flex items-center gap-1.5"><Save className="w-3.5 h-3.5" /> Enregistrer</button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div 
                                                                    onClick={() => {
                                                                        setEditingNoteId(r._id);
                                                                        setEditingNoteType('pressing');
                                                                        setTempNoteValue(r.owner_notes || "");
                                                                    }}
                                                                    className={`p-2 rounded-xl cursor-pointer transition-all border group relative
                                                                        ${r.owner_notes 
                                                                            ? 'bg-indigo-500/5 border-indigo-500/20 text-indigo-700 italic' 
                                                                            : 'bg-secondary/10 border-dashed border-border/50 text-muted-foreground hover:bg-secondary/20 h-8 flex items-center'}`}
                                                                >
                                                                    <span className="text-[10px] font-medium leading-relaxed pr-8 uppercase">
                                                                        {r.owner_notes ? `Note: "${r.owner_notes}"` : "+ Ajouter Note"}
                                                                    </span>
                                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <Edit2 className="w-3 h-3 text-indigo-400" />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Rendez-vous</p>
                                                        <div className="space-y-1">
                                                            <p className="text-sm font-bold text-primary">Apport: {r.bring_olives_date ? new Date(r.bring_olives_date).toLocaleDateString() : "Non programmé"}</p>
                                                            <p className="text-sm font-bold text-primary">Collecte: {r.collect_oil_date ? new Date(r.collect_oil_date).toLocaleDateString() : "Non programmé"}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                                                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
                                                        <Clock className="w-4 h-4 text-amber-500" />
                                                        {r.status}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {r.status === 'pending' && <StatusBtn onClick={() => updatePressingStatus(r._id, 'accepted')} icon={CheckCircle2} label="Accepter" color="text-primary" />}
                                                         <StatusBtn 
                                                             onClick={() => {
                                                                 setSelectedItemForNotes(r);
                                                                 setNotesType('pressing');
                                                                 setNotesForm(r.owner_notes || "");
                                                                 setShowNotesModal(true);
                                                             }} 
                                                             icon={Edit2} 
                                                             label={t("dashboard.notes.btn")} 
                                                             color="text-indigo-600" 
                                                         />
                                                         {(r.status === 'pending' || r.status === 'accepted') && <StatusBtn onClick={() => updatePressingStatus(r._id, 'completed')} icon={CheckCircle2} label="Terminé" color="text-green-500" />}
                                                        {['completed', 'rejected'].includes(r.status) && <StatusBtn onClick={() => archivePressing(r._id)} icon={Trash2} label="Archiver" color="text-muted-foreground" />}
                                                        <StatusBtn onClick={() => updatePressingStatus(r._id, 'rejected')} icon={XCircle} label="Refuser" color="text-red-500" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {pressingRequests.length === 0 && (
                                            <div className="text-center py-20 border border-dashed border-border rounded-3xl">
                                                <Factory className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                                                <p className="text-muted-foreground">Aucune demande de pressage.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === "agenda" && (
                                <div className="space-y-10">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                                        <h2 className="text-2xl font-bold flex items-center gap-3 whitespace-nowrap">
                                            <ClipboardList className="w-7 h-7 text-primary" />
                                            {t("dashboard.agenda.title")}
                                        </h2>
                                        <div className="relative w-full md:w-96">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <input
                                                type="text"
                                                placeholder={t("dashboard.agenda.search_placeholder")}
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full pl-11 pr-4 py-2.5 bg-secondary/30 border border-border/50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-12">
                                        {/* Group 1: Deliveries & Pickups */}
                                        <div className="space-y-6">
                                            <h3 className="text-xl font-bold px-2 flex items-center gap-2 text-muted-foreground/80">
                                                <Truck className="w-5 h-5" />
                                                {t("dashboard.agenda.pickups")}
                                            </h3>
                                            <div className="grid gap-4">
                                                {[
                                                    ...orders.filter(o => o.shipping?.type === 'pickup' && o.shipping.pickup_range_start).map(o => ({
                                                        ...o,
                                                        agendaType: 'pickup',
                                                        agendaDate: o.shipping.pickup_range_start
                                                    })),
                                                    ...orders.filter(o => o.shipping?.type === 'delivery').map(o => ({
                                                        ...o,
                                                        agendaType: 'delivery',
                                                        agendaDate: o.created_at
                                                    }))
                                                ]
                                                .filter(item => {
                                                    const searchStr = `${item._id} ${item.tracking_code || ''} ${item.user_id?.first_name} ${item.user_id?.last_name} ${item.user_id?.phone} ${item.user_id?.email}`.toLowerCase();
                                                    return searchStr.includes(searchTerm.toLowerCase());
                                                })
                                                .sort((a, b) => new Date(a.agendaDate).getTime() - new Date(b.agendaDate).getTime()).map((item, idx) => (
                                                    <div key={`delivery-${idx}`} id={`agenda-order-${item._id}`} className="bg-secondary/20 border border-border/50 p-5 rounded-[28px] hover:bg-secondary/30 transition-all">
                                                        <div className="flex justify-between items-center">
                                                            <div className="flex items-center gap-4">
                                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.agendaType === 'pickup' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                                                    {item.agendaType === 'pickup' ? <MapPin className="w-5 h-5" /> : <Truck className="w-5 h-5" />}
                                                                </div>
                                                                <div>
                                                                    <div className="flex flex-col">
                                                                        <h4 className="font-bold underline cursor-pointer" onClick={() => {
                                                                            setActiveTab('orders');
                                                                            setSearchTerm(item._id);
                                                                        }}>{item.user_id?.first_name} {item.user_id?.last_name}</h4>
                                                                        <p className="text-[10px] font-black text-indigo-600">#{item.tracking_code || item._id.slice(-6).toUpperCase()}</p>
                                                                    </div>
                                                                    <div className="flex gap-3 mt-1">
                                                                        <a href={`tel:${item.user_id?.phone}`} className="text-[11px] font-bold text-primary flex items-center gap-1 hover:underline">
                                                                            <Phone className="w-3 h-3" /> {item.user_id?.phone}
                                                                        </a>
                                                                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                                                            <Clock className="w-3 h-3" /> {new Date(item.agendaDate).toLocaleDateString()}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {item.agendaType === 'delivery' && (
                                                                    <button 
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            deleteOrder(item._id);
                                                                        }} 
                                                                        className="p-2 rounded-full hover:bg-red-500/10 text-red-500 transition-colors"
                                                                        title="Supprimer la commande"
                                                                    >
                                                                        <Trash2 className="w-5 h-5" />
                                                                    </button>
                                                                )}
                                                                {item.agendaType === 'pickup' && (
                                                                    <button 
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            deleteOrder(item._id);
                                                                        }} 
                                                                        className="p-2 rounded-full hover:bg-red-500/10 text-red-500 transition-colors"
                                                                        title="Supprimer la commande"
                                                                    >
                                                                        <Trash2 className="w-5 h-5" />
                                                                    </button>
                                                                )}
                                                                <button onClick={() => {
                                                                    setActiveTab('orders');
                                                                    setSearchTerm(item._id);
                                                                }} className="p-2 rounded-full hover:bg-background transition-colors">
                                                                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="mt-3 ml-14">
                                                            {editingNoteId === item._id && editingNoteType === 'order' ? (
                                                                <div className="flex flex-col gap-2">
                                                                    <textarea
                                                                        value={tempNoteValue}
                                                                        onChange={(e) => setTempNoteValue(e.target.value)}
                                                                        autoFocus
                                                                        className="w-full bg-background border border-indigo-500/30 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
                                                                        rows={2}
                                                                        placeholder="Ajouter une note pour cette commande..."
                                                                    />
                                                                    <div className="flex gap-2 justify-end">
                                                                        <button 
                                                                            onClick={() => setEditingNoteId(null)}
                                                                            className="px-3 py-1.5 rounded-lg bg-secondary text-xs font-bold hover:bg-secondary/80 transition-colors"
                                                                        >
                                                                            Annuler
                                                                        </button>
                                                                        <button 
                                                                            onClick={() => updateNote(item._id, 'order', tempNoteValue)}
                                                                            className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
                                                                        >
                                                                            <Save className="w-3.5 h-3.5" /> Enregistrer
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div 
                                                                    onClick={() => {
                                                                        setEditingNoteId(item._id);
                                                                        setEditingNoteType('order');
                                                                        setTempNoteValue(item.owner_notes || "");
                                                                    }}
                                                                    className={`p-3 rounded-2xl cursor-pointer transition-all border group relative
                                                                        ${item.owner_notes 
                                                                            ? 'bg-indigo-500/5 border-indigo-500/20 text-indigo-700 italic' 
                                                                            : 'bg-secondary/10 border-dashed border-border/50 text-muted-foreground hover:bg-secondary/20 h-10 flex items-center'}`}
                                                                >
                                                                    <span className="text-[11px] font-medium leading-relaxed pr-8">
                                                                        {item.owner_notes ? `"${item.owner_notes}"` : "+ Ajouter une note privée..."}
                                                                    </span>
                                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <Edit2 className="w-3.5 h-3.5 text-indigo-400" />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                                {orders.filter(o => (o.shipping?.type === 'pickup' && o.shipping.pickup_range_start) || o.shipping?.type === 'delivery').length === 0 && (
                                                    <p className="text-sm text-muted-foreground italic px-4">Aucune livraison prévue.</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Group 2: Pressing Reservations (Brief List) */}
                                        <div className="space-y-6">
                                            <h3 className="text-xl font-bold px-2 flex items-center gap-2 text-muted-foreground/80">
                                                <Factory className="w-5 h-5" />
                                                {t("dashboard.agenda.pressing")}
                                            </h3>
                                            <div className="grid gap-4">
                                                {pressingRequests
                                                .filter(r => r.bring_olives_date || r.collect_oil_date)
                                                .filter(r => {
                                                    const searchStr = `${r.user_id?.first_name} ${r.user_id?.last_name} ${r.user_id?.phone}`.toLowerCase();
                                                    return searchStr.includes(searchTerm.toLowerCase());
                                                })
                                                .sort((a, b) => new Date(a.bring_olives_date || a.collect_oil_date).getTime() - new Date(b.bring_olives_date || b.collect_oil_date).getTime()).map((r, idx) => (
                                                    <div key={`pressing-${idx}`} className="bg-primary/5 border border-primary/10 p-5 rounded-[28px] hover:bg-primary/10 transition-all border-l-4 border-l-primary">
                                                        <div className="flex justify-between items-center">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                                                    {idx + 1}
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-bold underline cursor-pointer" onClick={() => {
                                                                        setActiveTab('pressing');
                                                                        setSearchTerm(r._id);
                                                                    }}>{r.user_id?.first_name} {r.user_id?.last_name}</h4>
                                                                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                                                        <a href={`tel:${r.user_id?.phone}`} className="text-[11px] font-bold text-primary flex items-center gap-1 hover:underline">
                                                                            <Phone className="w-3 h-3" /> {r.user_id?.phone}
                                                                        </a>
                                                                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                                                            <Clock className="w-3 h-3" /> Apport: {r.bring_olives_date ? new Date(r.bring_olives_date).toLocaleDateString() : "N/A"}
                                                                        </span>
                                                                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                                                            <Clock className="w-3 h-3" /> Collecte: {r.collect_oil_date ? new Date(r.collect_oil_date).toLocaleDateString() : "N/A"}
                                                                        </span>
                                                                        <span className="text-[11px] font-black uppercase tracking-wider bg-background px-2 py-0.5 rounded-full border border-border/10">
                                                                            {r.olive_quantity_kg}kg
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <button onClick={() => {
                                                                setActiveTab('pressing');
                                                                setSearchTerm(r._id);
                                                            }} className="p-2 rounded-full hover:bg-background transition-colors">
                                                                <ChevronRight className="w-5 h-5 text-primary" />
                                                            </button>
                                                        </div>
                                                        <div className="mt-3 ml-14">
                                                            {editingNoteId === r._id && editingNoteType === 'pressing' ? (
                                                                <div className="flex flex-col gap-2">
                                                                    <textarea
                                                                        value={tempNoteValue}
                                                                        onChange={(e) => setTempNoteValue(e.target.value)}
                                                                        autoFocus
                                                                        className="w-full bg-background border border-primary/30 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
                                                                        rows={2}
                                                                        placeholder="Note pour ce pressage..."
                                                                    />
                                                                    <div className="flex gap-2 justify-end">
                                                                        <button 
                                                                            onClick={() => setEditingNoteId(null)}
                                                                            className="px-3 py-1.5 rounded-lg bg-secondary text-xs font-bold hover:bg-secondary/80 transition-colors"
                                                                        >
                                                                            Annuler
                                                                        </button>
                                                                        <button 
                                                                            onClick={() => updateNote(r._id, 'pressing', tempNoteValue)}
                                                                            className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-colors flex items-center gap-1.5"
                                                                        >
                                                                            <Save className="w-3.5 h-3.5" /> Enregistrer
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div 
                                                                    onClick={() => {
                                                                        setEditingNoteId(r._id);
                                                                        setEditingNoteType('pressing');
                                                                        setTempNoteValue(r.owner_notes || "");
                                                                    }}
                                                                    className={`p-3 rounded-2xl cursor-pointer transition-all border group relative
                                                                        ${r.owner_notes 
                                                                            ? 'bg-primary/5 border-primary/20 text-primary italic' 
                                                                            : 'bg-secondary/10 border-dashed border-border/50 text-muted-foreground hover:bg-secondary/20 h-10 flex items-center'}`}
                                                                >
                                                                    <span className="text-[11px] font-medium leading-relaxed pr-8">
                                                                        {r.owner_notes ? `"${r.owner_notes}"` : "+ Ajouter une note..."}
                                                                    </span>
                                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <Edit2 className="w-3.5 h-3.5 text-primary/40" />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                                {pressingRequests.filter(r => r.bring_olives_date || r.collect_oil_date).length === 0 && (
                                                    <p className="text-sm text-muted-foreground italic px-4">Aucune réservation de pressage programmée.</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                             {activeTab === "agenda_pressing" && (
                                <div className="space-y-12 pb-20">
                                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                                        <div>
                                            <h2 className="text-3xl font-bold flex items-center gap-3">
                                                <Calendar className="w-8 h-8 text-primary" />
                                                {t("dashboard.agenda_pressing.title")}
                                            </h2>
                                            <p className="text-muted-foreground mt-2">Gérez le planning des rendez-vous de trituration.</p>
                                        </div>
                                        <div className="relative w-full md:w-96">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <input
                                                type="text"
                                                placeholder={t("dashboard.agenda.search_placeholder")}
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full pl-11 pr-4 py-2.5 bg-secondary/30 border border-border/50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                        {/* To Schedule */}
                                        <div className="space-y-6">
                                            <h3 className="text-xl font-bold flex items-center gap-2 text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-4 py-2 rounded-2xl w-fit">
                                                <Phone className="w-5 h-5" />
                                                {t("dashboard.agenda_pressing.to_schedule")}
                                            </h3>
                                            <div className="space-y-4">
                                                {pressingRequests
                                                .filter(r => !r.bring_olives_date && !r.collect_oil_date && (r.status === 'pending' || r.status === 'accepted'))
                                                .filter(r => {
                                                    const searchStr = `${r._id} ${r.user_id?.first_name} ${r.user_id?.last_name} ${r.user_id?.phone} ${r.user_id?.email}`.toLowerCase();
                                                    return searchStr.includes(searchTerm.toLowerCase());
                                                })
                                                .map(r => (
                                                    <div key={r._id} id={`agenda-pressing-${r._id}`} className="bg-background border border-border p-5 rounded-[28px] hover:shadow-lg transition-all group">
                                                        <div className="flex justify-between items-start gap-4">
                                                            <div>
                                                                <h4 className="font-bold text-lg cursor-pointer hover:underline decoration-primary/30" onClick={() => {
                                                                    setActiveTab('pressing');
                                                                    setSearchTerm(r._id);
                                                                }}>{r.user_id?.first_name} {r.user_id?.last_name}</h4>
                                                                <a href={`tel:${r.user_id?.phone}`} className="text-sm font-bold text-primary flex items-center gap-2 mt-1 hover:underline">
                                                                    <Phone className="w-4 h-4" /> {r.user_id?.phone}
                                                                </a>
                                                                <div className="mt-3 flex items-center gap-4 text-xs font-medium text-muted-foreground">
                                                                    <span className="bg-secondary px-3 py-1 rounded-full">{r.olive_quantity_kg}kg Olives</span>
                                                                    <span className="uppercase tracking-widest">{r.oil_quality}</span>
                                                                </div>
                                                                <div className="mt-3">
                                                                    {editingNoteId === r._id && editingNoteType === 'pressing' ? (
                                                                        <div className="flex flex-col gap-2">
                                                                            <textarea
                                                                                value={tempNoteValue}
                                                                                onChange={(e) => setTempNoteValue(e.target.value)}
                                                                                autoFocus
                                                                                className="w-full bg-background border border-indigo-500/30 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
                                                                                rows={2}
                                                                                placeholder="Note pour ce pressage..."
                                                                            />
                                                                            <div className="flex gap-2 justify-end">
                                                                                <button 
                                                                                    onClick={() => setEditingNoteId(null)}
                                                                                    className="px-3 py-1.5 rounded-lg bg-secondary text-xs font-bold hover:bg-secondary/80 transition-colors"
                                                                                >
                                                                                    Annuler
                                                                                </button>
                                                                                <button 
                                                                                    onClick={() => updateNote(r._id, 'pressing', tempNoteValue)}
                                                                                    className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
                                                                                >
                                                                                    <Save className="w-3.5 h-3.5" /> Enregistrer
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div 
                                                                            onClick={() => {
                                                                                setEditingNoteId(r._id);
                                                                                setEditingNoteType('pressing');
                                                                                setTempNoteValue(r.owner_notes || "");
                                                                            }}
                                                                            className={`p-2 rounded-xl cursor-pointer transition-all border group relative
                                                                                ${r.owner_notes 
                                                                                    ? 'bg-indigo-500/5 border-indigo-500/20 text-indigo-700 italic' 
                                                                                    : 'bg-secondary/10 border-dashed border-border/50 text-muted-foreground hover:bg-secondary/20 h-10 flex items-center'}`}
                                                                        >
                                                                            <span className="text-[11px] font-medium leading-relaxed pr-8">
                                                                                {r.owner_notes ? `"${r.owner_notes}"` : "+ Ajouter une note..."}
                                                                            </span>
                                                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                <Edit2 className="w-3.5 h-3.5 text-indigo-400" />
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col gap-2">
                                                                <button 
                                                                    onClick={() => {
                                                                        setSelectedPressForSchedule(r);
                                                                        setPressScheduleForm({ bring_olives_date: "", collect_oil_date: "" });
                                                                        setShowPressModal(true);
                                                                    }}
                                                                    className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:scale-105 transition-transform shadow-lg shadow-primary/20 whitespace-nowrap"
                                                                >
                                                                    {t("dashboard.agenda_pressing.btn_schedule")}
                                                                </button>
                                                                <button 
                                                                    onClick={() => deletePressing(r._id)}
                                                                    className="p-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors flex items-center justify-center gap-1.5 text-[10px] font-bold"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" /> Supprimer
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                {pressingRequests.filter(r => !r.bring_olives_date && !r.collect_oil_date && (r.status === 'pending' || r.status === 'accepted')).length === 0 && (
                                                    <div className="text-center py-10 border border-dashed border-border rounded-[32px] bg-secondary/5">
                                                        <CheckCircle2 className="w-8 h-8 text-green-500/30 mx-auto mb-3" />
                                                        <p className="text-sm text-muted-foreground">{t("dashboard.agenda_pressing.empty_to_schedule")}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Scheduled */}
                                        <div className="space-y-6">
                                            <h3 className="text-xl font-bold flex items-center gap-2 text-primary bg-primary/5 px-4 py-2 rounded-2xl w-fit">
                                                <Calendar className="w-5 h-5" />
                                                {t("dashboard.agenda_pressing.scheduled")}
                                            </h3>
                                            <div className="space-y-4">
                                                {pressingRequests.filter(r => r.bring_olives_date || r.collect_oil_date).sort((a, b) => new Date(a.bring_olives_date || a.collect_oil_date).getTime() - new Date(b.bring_olives_date || b.collect_oil_date).getTime()).map(r => (
                                                    <div key={r._id} className="bg-primary/5 border border-primary/10 p-5 rounded-[28px] relative overflow-hidden group">
                                                        <div className="absolute top-0 right-0 p-4">
                                                            <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm mb-1">
                                                                Apport: {r.bring_olives_date ? new Date(r.bring_olives_date).toLocaleDateString() : "N/A"}
                                                            </div>
                                                            <div className="bg-primary/20 text-primary border border-primary/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">
                                                                Collecte: {r.collect_oil_date ? new Date(r.collect_oil_date).toLocaleDateString() : "N/A"}
                                                            </div>
                                                        </div>
                                                        <h4 className="font-bold text-lg cursor-pointer hover:underline decoration-primary/30" onClick={() => {
                                                            setActiveTab('pressing');
                                                            setSearchTerm(r._id);
                                                        }}>{r.user_id?.first_name} {r.user_id?.last_name}</h4>
                                                        <p className="text-sm font-bold text-muted-foreground flex items-center gap-2 mt-1">
                                                            <Phone className="w-4 h-4" /> {r.user_id?.phone}
                                                        </p>
                                                        <div className="mt-4 flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center border border-border/50">
                                                                    <Package className="w-4 h-4 text-primary" />
                                                                </div>
                                                                <span className="text-xs font-bold">{r.olive_quantity_kg} kg</span>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <button 
                                                                    onClick={() => deletePressing(r._id)}
                                                                    className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                                    title="Supprimer"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                                <button 
                                                                    onClick={() => {
                                                                        setSelectedPressForSchedule(r);
                                                                        setPressScheduleForm({ 
                                                                            bring_olives_date: r.bring_olives_date ? new Date(r.bring_olives_date).toISOString().split('T')[0] : "",
                                                                            collect_oil_date: r.collect_oil_date ? new Date(r.collect_oil_date).toISOString().split('T')[0] : ""
                                                                        });
                                                                        setShowPressModal(true);
                                                                    }}
                                                                    className="text-[10px] font-bold text-primary hover:underline"
                                                                >
                                                                    Modifier
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="mt-4">
                                                            {editingNoteId === r._id && editingNoteType === 'pressing' ? (
                                                                <div className="flex flex-col gap-2">
                                                                    <textarea
                                                                        value={tempNoteValue}
                                                                        onChange={(e) => setTempNoteValue(e.target.value)}
                                                                        autoFocus
                                                                        className="w-full bg-background border border-primary/30 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
                                                                        rows={2}
                                                                        placeholder="Note pour ce pressage..."
                                                                    />
                                                                    <div className="flex gap-2 justify-end">
                                                                        <button onClick={() => setEditingNoteId(null)} className="px-3 py-1.5 rounded-lg bg-secondary text-xs font-bold hover:bg-secondary/80 transition-colors">Annuler</button>
                                                                        <button onClick={() => updateNote(r._id, 'pressing', tempNoteValue)} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-colors flex items-center gap-1.5"><Save className="w-3.5 h-3.5" /> Enregistrer</button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div 
                                                                    onClick={() => {
                                                                        setEditingNoteId(r._id);
                                                                        setEditingNoteType('pressing');
                                                                        setTempNoteValue(r.owner_notes || "");
                                                                    }}
                                                                    className={`p-2 rounded-xl cursor-pointer transition-all border group relative
                                                                        ${r.owner_notes 
                                                                            ? 'bg-primary/10 border-primary/20 text-primary italic' 
                                                                            : 'bg-secondary/10 border-dashed border-border/50 text-muted-foreground hover:bg-secondary/20 h-8 flex items-center'}`}
                                                                >
                                                                    <span className="text-[10px] font-medium leading-relaxed pr-8">
                                                                        {r.owner_notes ? `"${r.owner_notes}"` : "+ Note privée..."}
                                                                    </span>
                                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <Edit2 className="w-3 h-3 text-primary/40" />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                                {pressingRequests.filter(r => r.bring_olives_date || r.collect_oil_date).length === 0 && (
                                                    <p className="text-center py-10 text-sm text-muted-foreground italic bg-secondary/5 rounded-[32px] border border-dashed border-border">
                                                        {t("dashboard.agenda_pressing.empty_scheduled")}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "agenda_contacts" && (
                                <div className="space-y-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                                        <h2 className="text-2xl font-bold flex items-center gap-3">
                                            <UsersIcon className="w-7 h-7 text-primary" />
                                            {t("dashboard.contacts.title")}
                                        </h2>
                                        <div className="relative w-full md:w-96">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <input
                                                type="text"
                                                placeholder={t("dashboard.contacts.search_placeholder")}
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full pl-11 pr-4 py-2.5 bg-secondary/30 border border-border/50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {allUsers
                                        .filter(u => {
                                            const searchStr = `${u.first_name} ${u.last_name} ${u.phone} ${u.email} ${u.address || ''}`.toLowerCase();
                                            return searchStr.includes(searchTerm.toLowerCase());
                                        })
                                        .map(u => (
                                            <div key={u._id} className={`bg-secondary/30 border p-6 rounded-[32px] transition-all relative overflow-hidden group hover:border-primary/20 ${u.is_blacklisted ? 'border-red-500/20 bg-red-500/5' : 'border-border'}`}>
                                                <div className="flex items-center gap-4 mb-6">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg border ${u.is_blacklisted ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                                                        {u.first_name[0]}{u.last_name[0]}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-base truncate flex items-center gap-2">
                                                            {u.first_name} {u.last_name}
                                                            {u.is_blacklisted && (
                                                                <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[8px] font-black uppercase tracking-tighter">
                                                                    {t("dashboard.common.blacklisted")}
                                                                </span>
                                                            )}
                                                        </h4>
                                                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-3 mb-6">
                                                    <div className="flex items-center gap-3 text-sm">
                                                        <Phone className="w-4 h-4 text-primary" />
                                                        <a href={`tel:${u.phone}`} className="font-bold hover:underline">{u.phone}</a>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-sm">
                                                        <Calendar className="w-4 h-4 text-primary" />
                                                        <span className="text-muted-foreground">{t("dashboard.contacts.registered_on")} {new Date(u.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                </div>

                                                <div className="pt-4 border-t border-border/50 flex gap-2">
                                                    <button
                                                        onClick={() => toggleBlacklist(u._id)}
                                                        className={`flex-1 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-2 border ${u.is_blacklisted 
                                                            ? 'bg-background text-foreground border-border hover:bg-secondary' 
                                                            : 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white'}`}
                                                    >
                                                        {u.is_blacklisted ? (
                                                            <>
                                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                                {t("dashboard.common.unblock")}
                                                            </>
                                                        ) : (
                                                            <>
                                                                <XCircle className="w-3.5 h-3.5" />
                                                                {t("dashboard.common.blacklist")}
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {allUsers.length === 0 && (
                                        <div className="text-center py-20 border border-dashed border-border rounded-3xl">
                                            <UsersIcon className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                                            <p className="text-muted-foreground">{t("dashboard.contacts.empty")}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === "archive" && (
                                <div className="space-y-12 pb-10">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                                        <h2 className="text-2xl font-bold flex items-center gap-3">
                                            <Archive className="w-7 h-7 text-primary" />
                                            Archives
                                        </h2>
                                        <div className="relative w-full md:w-96">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <input
                                                type="text"
                                                placeholder="Rechercher dans les archives (Nom, Tel, ID)..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                autoComplete="off"
                                                className="w-full pl-11 pr-4 py-2.5 bg-secondary/30 border border-border/50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className="text-xl font-bold px-2 flex items-center gap-2">
                                            <ShoppingBag className="w-5 h-5 text-primary" />
                                            Commandes Archivées
                                        </h3>
                                        <div className="grid gap-4">
                                            {archivedOrders
                                            .filter(o => {
                                                const searchStr = `${o._id} ${o.tracking_code || ''} ${o.user_id?.first_name} ${o.user_id?.last_name} ${o.user_id?.phone} ${o.user_id?.email}`.toLowerCase();
                                                return searchStr.includes(searchTerm.toLowerCase());
                                            })
                                            .map(o => (
                                                <div key={o._id} className="bg-secondary/10 border border-border p-6 rounded-3xl opacity-80">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <h4 className="font-bold text-lg">{o.user_id?.first_name} {o.user_id?.last_name}</h4>
                                                                <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">#{o.tracking_code || o._id.slice(-6).toUpperCase()}</span>
                                                            </div>
                                                                    <div className="mt-4">
                                                                        {editingNoteId === o._id && editingNoteType === 'order' ? (
                                                                            <div className="flex flex-col gap-2">
                                                                                <textarea
                                                                                    value={tempNoteValue}
                                                                                    onChange={(e) => setTempNoteValue(e.target.value)}
                                                                                    autoFocus
                                                                                    className="w-full bg-background border border-indigo-500/30 rounded-xl p-3 text-sm"
                                                                                    rows={2}
                                                                                />
                                                                                <div className="flex gap-2 justify-end">
                                                                                    <button onClick={() => setEditingNoteId(null)} className="px-3 py-1.5 rounded-lg bg-secondary text-xs font-bold">Annuler</button>
                                                                                    <button onClick={() => updateNote(o._id, 'order', tempNoteValue)} className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold flex items-center gap-1.5"><Save className="w-3.5 h-3.5" /> Sauver</button>
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            <div 
                                                                                onClick={() => {
                                                                                    setEditingNoteId(o._id);
                                                                                    setEditingNoteType('order');
                                                                                    setTempNoteValue(o.owner_notes || "");
                                                                                }}
                                                                                className={`p-2 rounded-xl cursor-pointer transition-all border group relative
                                                                                    ${o.owner_notes ? 'bg-indigo-500/5 border-indigo-500/20 text-indigo-700 italic' : 'bg-secondary/10 border-dashed border-border/50 text-muted-foreground h-8 flex items-center'}`}
                                                                            >
                                                                                <span className="text-[10px] font-medium pr-8 uppercase">
                                                                                    {o.owner_notes ? `Note: "${o.owner_notes}"` : "+ Ajouter Note"}
                                                                                </span>
                                                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                    <Edit2 className="w-3 h-3 text-indigo-400" />
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                            <p className="text-xs text-primary font-bold mt-3">
                                                                {o.items.map((i: any) => i.quantity + (i.model_type === 'Product' || i.model_type === 'OliveCategory' ? 'L ' : 'kg ') + (i.olive_category_id?.name || i.pressing_service_id?.name || (i.olive_category_id ? `ID: ${i.olive_category_id}` : 'Produit'))).join(', ')}
                                                            </p>
                                                            <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest font-bold">Status: {o.status}</p>
                                                        </div>
                                                        <StatusBtn onClick={() => deleteOrder(o._id)} icon={Trash2} label="Supprimer" color="text-red-500" />
                                                    </div>
                                                </div>
                                            ))}
                                            {archivedOrders.length === 0 && <p className="text-center text-sm text-muted-foreground py-10">Aucune commande archivée.</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className="text-xl font-bold px-2 flex items-center gap-2">
                                            <Factory className="w-5 h-5 text-primary" />
                                            Pressages Archivés
                                        </h3>
                                        <div className="grid gap-4">
                                            {archivedPressing
                                            .filter(r => {
                                                const searchStr = `${r._id} ${r.user_id?.first_name} ${r.user_id?.last_name} ${r.user_id?.phone} ${r.user_id?.email}`.toLowerCase();
                                                return searchStr.includes(searchTerm.toLowerCase());
                                            })
                                            .map(r => (
                                                <div key={r._id} className="bg-secondary/10 border border-border p-6 rounded-3xl opacity-80">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <h4 className="font-bold">{r.user_id?.first_name} {r.user_id?.last_name}</h4>
                                                            <div className="flex items-center gap-3 mt-1">
                                                                <a href={`tel:${r.user_id?.phone}`} className="text-[10px] text-primary font-bold hover:underline">📞 {r.user_id?.phone}</a>
                                                                <p className="text-[10px] text-muted-foreground">{r.user_id?.email}</p>
                                                            </div>
                                                            <p className="text-xs text-muted-foreground mt-2">{r.olive_quantity_kg}kg - {r.oil_quality}</p>
                                                            <div className="mt-4">
                                                                {editingNoteId === r._id && editingNoteType === 'pressing' ? (
                                                                    <div className="flex flex-col gap-2">
                                                                        <textarea
                                                                            value={tempNoteValue}
                                                                            onChange={(e) => setTempNoteValue(e.target.value)}
                                                                            autoFocus
                                                                            className="w-full bg-background border border-primary/30 rounded-xl p-3 text-sm"
                                                                            rows={2}
                                                                        />
                                                                        <div className="flex gap-2 justify-end">
                                                                            <button onClick={() => setEditingNoteId(null)} className="px-3 py-1.5 rounded-lg bg-secondary text-xs font-bold">Annuler</button>
                                                                            <button onClick={() => updateNote(r._id, 'pressing', tempNoteValue)} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1.5"><Save className="w-3.5 h-3.5" /> Sauver</button>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div 
                                                                        onClick={() => {
                                                                            setEditingNoteId(r._id);
                                                                            setEditingNoteType('pressing');
                                                                            setTempNoteValue(r.owner_notes || "");
                                                                        }}
                                                                        className={`p-2 rounded-xl cursor-pointer transition-all border group relative
                                                                            ${r.owner_notes ? 'bg-primary/5 border-primary/20 text-primary italic' : 'bg-secondary/10 border-dashed border-border/50 text-muted-foreground h-8 flex items-center'}`}
                                                                    >
                                                                        <span className="text-[10px] font-medium pr-8 uppercase">
                                                                            {r.owner_notes ? `Note: "${r.owner_notes}"` : "+ Ajouter Note"}
                                                                        </span>
                                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                            <Edit2 className="w-3 h-3 text-primary/40" />
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest font-bold">Status: {r.status}</p>
                                                        </div>
                                                        <StatusBtn onClick={() => deletePressing(r._id)} icon={Trash2} label="Supprimer" color="text-red-500" />
                                                    </div>
                                                </div>
                                            ))}
                                            {archivedPressing.length === 0 && <p className="text-center text-sm text-muted-foreground py-10">Aucun pressage archivé.</p>}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <Footer />

            {/* Product Modal */}
            <AnimatePresence>
                {showProductModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowProductModal(false)}
                            className="absolute inset-0 bg-background/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-lg bg-secondary/50 border border-border p-8 rounded-[40px] shadow-2xl backdrop-blur-xl"
                        >
                            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                {editingProduct ? <Edit2 className="w-6 h-6 text-primary" /> : <Plus className="w-6 h-6 text-primary" />}
                                {editingProduct ? "Modifier le Produit" : "Nouveau Produit"}
                            </h3>
                            <form onSubmit={handleProductSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">Nom du produit</label>
                                    <input
                                        required
                                        type="text"
                                        value={productForm.name}
                                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                                        className="w-full bg-background border border-border rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                        placeholder="Ex: Huile d'Olive Extra Vierge 5L"
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">Catégorie</label>
                                        <select
                                            value={productForm.category}
                                            onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                                            className="w-full bg-background border border-border rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                                        >
                                            <option value="extra_virgin">Extra Vierge</option>
                                            <option value="virgin">Vierge</option>
                                            <option value="third_quality">3ème Pression</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">Prix (DA/L)</label>
                                        <input
                                            required
                                            type="number"
                                            value={productForm.price_per_liter}
                                            onChange={(e) => setProductForm({ ...productForm, price_per_liter: parseFloat(e.target.value) })}
                                            className="w-full bg-background border border-border rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">Stock Initial (Litres)</label>
                                    <input
                                        required
                                        type="number"
                                        value={productForm.stock_liters}
                                        onChange={(e) => setProductForm({ ...productForm, stock_liters: parseFloat(e.target.value) })}
                                        className="w-full bg-background border border-border rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                    />
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowProductModal(false)}
                                        className="flex-1 px-8 py-4 rounded-2xl border border-border font-bold hover:bg-secondary transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
                                    >
                                        {editingProduct ? "Enregistrer" : "Créer le produit"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Notes Modal */}
            <AnimatePresence>
                {showNotesModal && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowNotesModal(false)}
                            className="absolute inset-0 bg-background/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-md bg-secondary border border-border p-8 rounded-[40px] shadow-2xl backdrop-blur-xl"
                        >
                            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                <Edit2 className="w-6 h-6 text-indigo-600" />
                                {t("dashboard.notes.modal_title")}
                            </h3>
                            <form onSubmit={handleNotesSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">
                                        Notes privées (client: {selectedItemForNotes?.user_id?.first_name})
                                    </label>
                                    <textarea
                                        value={notesForm}
                                        onChange={(e) => setNotesForm(e.target.value)}
                                        className="w-full h-40 bg-background border border-border rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
                                        placeholder={t("dashboard.notes.placeholder")}
                                    />
                                </div>
                                <div className="flex gap-4 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowNotesModal(false)}
                                        className="flex-1 px-8 py-4 rounded-2xl border border-border font-bold hover:bg-secondary transition-colors text-sm"
                                    >
                                        {t("dashboard.common.cancel")}
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-8 py-4 rounded-2xl bg-indigo-600 text-white font-bold hover:opacity-90 transition-opacity shadow-lg shadow-indigo-600/20 text-sm flex items-center justify-center gap-2"
                                    >
                                        <Save className="w-4 h-4" />
                                        {t("dashboard.common.save")}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Pickup Scheduling Modal */}
            <AnimatePresence>
                {showPickupModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowPickupModal(false)}
                            className="absolute inset-0 bg-background/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-md bg-secondary border border-border p-8 rounded-[40px] shadow-2xl backdrop-blur-xl"
                        >
                            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                <Clock className="w-6 h-6 text-primary" />
                                {t("dashboard.pickup_modal.title")}
                            </h3>
                            <form onSubmit={handlePickupSubmit} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">{t("dashboard.pickup_modal.start_date")}</label>
                                        <input 
                                            type="date" 
                                            required
                                            value={pickupForm.pickup_range_start} 
                                            onChange={(e) => setPickupForm({ ...pickupForm, pickup_range_start: e.target.value })}
                                            className="w-full bg-background border border-border rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">{t("dashboard.pickup_modal.end_date")}</label>
                                        <input 
                                            type="date" 
                                            required
                                            value={pickupForm.pickup_range_end} 
                                            onChange={(e) => setPickupForm({ ...pickupForm, pickup_range_end: e.target.value })}
                                            className="w-full bg-background border border-border rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">{t("dashboard.pickup_modal.hours")}</label>
                                    <input 
                                        type="text" 
                                        required
                                        placeholder="Ex: 08:00 - 17:00"
                                        value={pickupForm.pickup_hours} 
                                        onChange={(e) => setPickupForm({ ...pickupForm, pickup_hours: e.target.value })}
                                        className="w-full bg-background border border-border rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowPickupModal(false)}
                                        className="flex-1 bg-background border border-border py-4 rounded-2xl font-bold text-sm hover:bg-secondary transition-colors"
                                    >
                                        {t("dashboard.pickup_modal.cancel")}
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-primary text-primary-foreground py-4 rounded-2xl font-bold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
                                    >
                                        {t("dashboard.pickup_modal.confirm")}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Pressing Scheduling Modal */}
            <AnimatePresence>
                {showPressModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowPressModal(false)}
                            className="absolute inset-0 bg-background/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-md bg-secondary border border-border p-8 rounded-[40px] shadow-2xl backdrop-blur-xl"
                        >
                            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                <Calendar className="w-6 h-6 text-primary" />
                                {t("dashboard.agenda_pressing.modal_title")}
                            </h3>
                            <form onSubmit={handlePressScheduleSubmit} className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">Date d'apport des olives</label>
                                    <input 
                                        type="date" 
                                        required
                                        value={pressScheduleForm.bring_olives_date} 
                                        onChange={(e) => setPressScheduleForm({ ...pressScheduleForm, bring_olives_date: e.target.value })}
                                        className="w-full bg-background border border-border rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">Date de récupération d'huile (Prévue)</label>
                                    <input 
                                        type="date" 
                                        value={pressScheduleForm.collect_oil_date} 
                                        onChange={(e) => setPressScheduleForm({ ...pressScheduleForm, collect_oil_date: e.target.value })}
                                        className="w-full bg-background border border-border rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowPressModal(false)}
                                        className="flex-1 bg-background border border-border py-4 rounded-2xl font-bold text-sm hover:bg-secondary transition-colors"
                                    >
                                        {t("dashboard.common.cancel")}
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-primary text-primary-foreground py-4 rounded-2xl font-bold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
                                    >
                                        {t("dashboard.agenda_pressing.modal_confirm")}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-secondary/30 border border-border p-6 rounded-3xl shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-2xl bg-background border border-border ${color}`}>
                <Icon className="w-5 h-5" />
            </div>
        </div>
        <h3 className="text-2xl font-black mb-1">{value}</h3>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{title}</p>
    </div>
);

const QuickActionButton = ({ onClick, label, icon: Icon }: any) => (
    <button
        onClick={onClick}
        className="flex items-center justify-between gap-4 p-5 bg-background border border-border rounded-2xl hover:border-primary/30 transition-all text-left"
    >
        <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/5 text-primary">
                <Icon className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold">{label}</span>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
    </button>
);

const StatusBtn = ({ icon: Icon, label, color, onClick }: any) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl bg-background border border-border text-[10px] font-black uppercase tracking-[0.1em] hover:bg-secondary transition-colors ${color}`}
    >
        <Icon className="w-3 h-3" />
        {label}
    </button>
);

export default Dashboard;

