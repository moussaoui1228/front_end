import { Router, Request, Response } from 'express';
import { OilQualitySetting } from '../models/OilQualitySetting';
import { authenticate, ownerOnly, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/oil-quality — Public
router.get('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const qualities = await OilQualitySetting.find();
        res.json(qualities);
    } catch {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

// PUT /api/oil-quality/:quality — Owner only
router.put('/:quality', authenticate, ownerOnly, async (req: AuthRequest, res: Response): Promise<void> => {
    const validQualities = ['extra_virgin', 'virgin', 'third_quality'];
    if (!validQualities.includes(req.params.quality)) {
        res.status(400).json({ message: 'Qualité invalide.' });
        return;
    }
    try {
        const setting = await OilQualitySetting.findOneAndUpdate(
            { quality_name: req.params.quality },
            req.body,
            { new: true }
        );
        if (!setting) {
            res.status(404).json({ message: 'Qualité introuvable.' });
            return;
        }
        res.json(setting);
    } catch {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

export default router;
