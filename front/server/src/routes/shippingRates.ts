import { Router, Request, Response } from 'express';
import { ShippingRate } from '../models/ShippingRate';
import { authenticate, ownerOnly, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/shipping-rates — Public
router.get('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const rates = await ShippingRate.find().sort({ wilaya_code: 1 });
        res.json(rates);
    } catch {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

// PUT /api/shipping-rates/:wilaya — Owner only
router.put('/:wilaya', authenticate, ownerOnly, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const rate = await ShippingRate.findOneAndUpdate(
            { wilaya: req.params.wilaya },
            { price: req.body.price },
            { new: true }
        );
        if (!rate) {
            res.status(404).json({ message: 'Wilaya introuvable.' });
            return;
        }
        res.json(rate);
    } catch {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

export default router;
