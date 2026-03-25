import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
    /** Visual variant: 'default' for pages with Navbar, 'auth' for fullscreen auth pages */
    variant?: "default" | "auth";
    className?: string;
}

const BackButton = ({ variant = "default", className = "" }: BackButtonProps) => {
    const navigate = useNavigate();

    if (variant === "auth") {
        return (
            <button
                onClick={() => navigate(-1)}
                className={`inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors group ${className}`}
            >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                Retour
            </button>
        );
    }

    return (
        <button
            onClick={() => navigate(-1)}
            className={`inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group mb-6 ${className}`}
        >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Retour
        </button>
    );
};

export default BackButton;
