import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, MessageSquare, User, Send, StarHalf, Trash2, AlertCircle } from "lucide-react";
import { useAuth } from "@/Context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import API_URL from "@/config";

interface IComment {
    _id: string;
    user_id: {
        _id: string;
        first_name: string;
        last_name: string;
    };
    content: string;
    rating: number;
    created_at: string;
}

const Testimonials = () => {
    const { user, token } = useAuth();
    const { toast } = useToast();
    const [comments, setComments] = useState<IComment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchComments = async () => {
        setFetching(true);
        setError(null);
        try {
            const res = await fetch(`${API_URL}/comments`);
            
            if (!res.ok) {
                if (res.status === 429) {
                    throw new Error("Trop de requêtes. Veuillez patienter.");
                }
                throw new Error("Erreur de chargement des avis.");
            }
            
            const data = await res.json();
            setComments(data);
        } catch (err: any) {
            console.error("Error fetching comments:", err);
            setError(err.message || "Impossible de charger les avis.");
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast({ title: "Connexion requise", description: "Vous devez être connecté pour laisser un avis.", variant: "destructive" });
            return;
        }
        if (!newComment.trim()) return;

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/comments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ content: newComment, rating }),
            });

            if (res.ok) {
                toast({ title: "Merci !", description: "Votre avis a été publié avec succès." });
                setNewComment("");
                setRating(5);
                fetchComments();
            } else {
                const data = await res.json();
                throw new Error(data.message || "Erreur lors de la publication.");
            }
        } catch (err: any) {
            toast({ title: "Erreur", description: err.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Voulez-vous vraiment supprimer ce commentaire ?")) return;

        try {
            const res = await fetch(`${API_URL}/comments/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                toast({ title: "Supprimé", description: "Le commentaire a été supprimé." });
                fetchComments();
            } else {
                const data = await res.json();
                throw new Error(data.message || "Erreur lors de la suppression.");
            }
        } catch (err: any) {
            toast({ title: "Erreur", description: err.message, variant: "destructive" });
        }
    };

    const renderStars = (count: number, interactive = false) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                        key={s}
                        className={`w-4 h-4 transition-all ${(interactive ? (hoverRating || rating) : count) >= s
                            ? "fill-primary text-primary scale-110"
                            : "text-muted-foreground/30"
                            } ${interactive ? "cursor-pointer hover:scale-125" : ""}`}
                        onClick={() => interactive && setRating(s)}
                        onMouseEnter={() => interactive && setHoverRating(s)}
                        onMouseLeave={() => interactive && setHoverRating(0)}
                    />
                ))}
            </div>
        );
    };

    return (
        <section className="py-24 bg-background overflow-hidden">
            <div className="container px-6 mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
                    <div className="max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-4"
                        >
                            <MessageSquare className="w-3 h-3" />
                            Témoignages
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl font-black tracking-tight"
                        >
                            Ce que disent nos <span className="text-primary">clients</span>.
                        </motion.h2>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8 items-start">
                    {/* Submission Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="lg:col-span-1 bg-secondary/30 border border-border p-8 rounded-[2rem] sticky top-24"
                    >
                        <h3 className="text-xl font-bold mb-6">Partagez votre expérience</h3>
                        {user ? (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Note globale</label>
                                    <div className="p-4 bg-background/50 rounded-2xl border border-border/50">
                                        {renderStars(rating, true)}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Votre avis</label>
                                    <textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Comment s'est passé votre visite au moulin ?"
                                        className="w-full bg-background/50 border border-border/50 rounded-2xl p-4 text-sm min-h-[120px] outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading || !newComment.trim()}
                                    className="w-full bg-primary text-primary-foreground py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
                                >
                                    {loading ? "Chargement..." : <><Send className="w-4 h-4" /> Publier mon avis</>}
                                </button>
                            </form>
                        ) : (
                            <div className="text-center py-6">
                                <p className="text-sm text-muted-foreground mb-4">Connectez-vous pour laisser un avis sur nos services.</p>
                                <Link to="/connexion?redirect=/" className="text-sm font-bold text-primary hover:underline flex items-center justify-center gap-2">
                                    Se connecter <Send className="w-3 h-3" />
                                </Link>
                            </div>
                        )}
                    </motion.div>

                    {/* Comments List */}
                    <div className="lg:col-span-2 space-y-6">
                        {fetching ? (
                            <div className="grid gap-6">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-40 bg-secondary/20 animate-pulse rounded-[2.5rem]" />
                                ))}
                            </div>
                        ) : error ? (
                            <div className="text-center py-16 bg-red-500/5 rounded-[2.5rem] border border-red-500/10">
                                <AlertCircle className="w-12 h-12 text-red-500/50 mx-auto mb-4" />
                                <p className="text-red-600 font-bold mb-4">{error}</p>
                                <button 
                                    onClick={fetchComments}
                                    className="px-6 py-2 bg-primary text-white rounded-full text-xs font-bold hover:scale-105 transition-transform"
                                >
                                    Faire une autre tentative
                                </button>
                            </div>
                        ) : comments.length > 0 ? (
                            <div className="grid gap-6">
                                {comments.map((c, idx) => (
                                    <motion.div
                                        key={c._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="bg-secondary/10 border border-border/50 p-8 rounded-[2.5rem] hover:bg-secondary/20 transition-all group"
                                    >
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                                                    <User className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-base">{c.user_id?.first_name} {c.user_id?.last_name}</h4>
                                                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">{new Date(c.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="px-3 py-1 bg-background rounded-full border border-border/50 shadow-sm">
                                                    {renderStars(c.rating)}
                                                </div>
                                                {(user?._id === c.user_id?._id || user?.role === 'owner') && (
                                                    <button
                                                        onClick={() => handleDelete(c._id)}
                                                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-all"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-foreground/80 text-sm leading-relaxed italic border-l-2 border-primary/20 pl-6 py-2">
                                            "{c.content}"
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-24 bg-secondary/5 rounded-[3rem] border border-dashed border-border/50">
                                <MessageSquare className="w-16 h-16 text-muted-foreground/10 mx-auto mb-6" />
                                <p className="text-muted-foreground font-bold text-lg">Soyez le premier à partager votre expérience !</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
