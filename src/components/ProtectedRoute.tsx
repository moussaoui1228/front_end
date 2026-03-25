import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/Context/AuthContext';

interface Props {
    children: React.ReactNode;
}

const ProtectedRoute = ({ children }: Props) => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        // Show nothing while restoring session (avoids flash redirect)
        return null;
    }

    if (!isAuthenticated) {
        // Redirect to login, saving the intended path
        return <Navigate to={`/connexion?redirect=${location.pathname}`} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
