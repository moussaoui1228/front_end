import { Router, Response } from 'express';
import { Notification } from '../models/Notification';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/notifications - Get user's notifications
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const notifications = await Notification.find({ user_id: req.user!.id }).sort({ created_at: -1 });
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la récupération des notifications.' });
    }
});

// PATCH /api/notifications/read-all - Mark all as read
router.patch('/read-all', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        await Notification.updateMany(
            { user_id: req.user!.id, is_read: false },
            { is_read: true }
        );
        res.json({ message: 'All notifications marked as read' });
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la mise à jour des notifications.' });
    }
});

// GET /api/notifications/unread-count - Get count of unread notifications
router.get('/unread-count', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const count = await Notification.countDocuments({ user_id: req.user!.id, is_read: false });
        res.json({ count });
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors du comptage des notifications.' });
    }
});

// PATCH /api/notifications/:id/read - Mark notification as read
router.patch('/:id/read', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, user_id: req.user!.id },
            { is_read: true },
            { new: true }
        );
        if (!notification) return res.status(404).json({ message: 'Notification non trouvée' });
        res.json(notification);
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la mise à jour de la notification.' });
    }
});

export default router;
