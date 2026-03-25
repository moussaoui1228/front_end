import { Router, Request, Response } from 'express';
import { Settings } from '../models/Settings';
import { authenticate, ownerOnly, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/settings
router.get('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const settings = await Settings.findOne();
        res.json(settings || { pressing_percentage_taken: 30 });
    } catch {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

// PUT /api/settings — Owner only
router.put('/', authenticate, ownerOnly, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const settings = await Settings.findOneAndUpdate(
            {},
            { ...req.body, updated_at: new Date() },
            { new: true, upsert: true }
        );
        res.json(settings);
    } catch {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

export default router;
