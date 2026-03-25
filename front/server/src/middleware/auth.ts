import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { IUser } from '../models/User';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        role: 'customer' | 'owner';
    };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Accès non autorisé. Veuillez vous connecter.' });
        return;
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
            id: string;
            role: 'customer' | 'owner';
        };
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token invalide ou expiré. Veuillez vous reconnecter.' });
    }
};

export const ownerOnly = (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (req.user?.role !== 'owner') {
        res.status(403).json({ message: 'Accès réservé au propriétaire.' });
        return;
    }
    next();
};
