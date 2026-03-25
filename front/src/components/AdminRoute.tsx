import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/Context/AuthContext';

interface Props {
    children: React.ReactNode;
}

const AdminRoute = ({ children }: Props) => {
    const { isAuthenticated, user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return null;
    }

    if (!isAuthenticated) {
        return <Navigate to={`/connexion?redirect=${location.pathname}`} replace />;
    }

    if (user?.role !== 'owner') {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default AdminRoute;
