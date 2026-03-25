/**
 * USERS ROUTE
 * Handles administration of the client base.
 * Only the owner can access these endpoints.
 */

import { Router, Response } from 'express';
import { User } from '../models/User';
import { authenticate, ownerOnly, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * [ADMIN] List all customers
 * Returns a list of all registered users who have the 'customer' role.
 * Sensitive info like passwords is never sent.
 */
router.get('/', authenticate, ownerOnly, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const users = await User.find({ role: 'customer' })
            .select('first_name last_name email phone address is_blacklisted created_at')
            .sort({ created_at: -1 });
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

/**
 * [ADMIN] Toggle Blacklist
 * Allows the owner to block or unblock a user.
 * A blacklisted user might be restricted from placing new orders.
 */
router.patch('/:id/blacklist', authenticate, ownerOnly, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            res.status(404).json({ message: 'Utilisateur non trouvé.' });
            return;
        }

        // Switch the status (true becomes false, false becomes true)
        user.is_blacklisted = !user.is_blacklisted;
        await user.save();

        res.json({ 
            message: user.is_blacklisted ? 'Utilisateur mis en liste noire.' : 'Utilisateur retiré de la liste noire.',
            is_blacklisted: user.is_blacklisted 
        });
    } catch (error) {
        console.error('Error toggling blacklist status:', error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

export default router;
