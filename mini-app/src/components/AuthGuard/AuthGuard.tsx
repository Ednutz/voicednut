import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../../services/userApi';

interface AuthGuardProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children, requireAdmin = false }) => {
    const navigate = useNavigate();

    useEffect(() => {
        const currentUser = userApi.getCurrentUser();
        const isAdmin = userApi.isAdmin();

        if (!currentUser) {
            navigate('/unauthorized');
            return;
        }

        if (requireAdmin && !isAdmin) {
            navigate('/forbidden');
            return;
        }
    }, [navigate, requireAdmin]);

    return <>{children}</>;
};