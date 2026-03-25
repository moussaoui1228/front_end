import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { OliveCategory } from '../models/OliveCategory';
import { PressingService } from '../models/PressingService';
import { authenticate, ownerOnly, AuthRequest } from '../middleware/auth';

const router = Router();

// --- Olive Categories ---

// GET /api/prices/olives - Public
router.get('/olives', async (req, res) => {
    try {
        const categories = await OliveCategory.find({ active: true });
        res.json(categories);
    } catch {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

// POST /api/prices/olives - Owner Only
router.post(
    '/olives',
    authenticate,
    ownerOnly,
    [
        body('name').notEmpty().withMessage('Le nom est requis'),
        body('price_per_liter').isNumeric().withMessage('Le prix doit être un nombre'),
        body('stock_liters').optional().isNumeric().withMessage('Le stock doit être un nombre'),
    ],
    async (req: AuthRequest, res: Response): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
        try {
            const category = await OliveCategory.create(req.body);
            res.status(201).json(category);
        } catch (error: any) {
            if (error.code === 11000) {
                res.status(400).json({ message: 'Cette catégorie existe déjà.' });
                return;
            }
            res.status(500).json({ message: 'Erreur serveur.' });
        }
    }
);

// PATCH /api/prices/olives/:id - Owner Only (Update Price)
router.patch(
    '/olives/:id',
    authenticate,
    ownerOnly,
    [
        body('name').optional().notEmpty().withMessage('Le nom ne peut pas être vide'),
        body('price_per_liter').optional().isNumeric().withMessage('Le prix doit être un nombre'),
        body('stock_liters').optional().isNumeric().withMessage('Le stock doit être un nombre'),
        body('active').optional().isBoolean().withMessage('Actif doit être un booléen'),
    ],
    async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const category = await OliveCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!category) {
                res.status(404).json({ message: 'Catégorie introuvable.' });
                return;
            }
            res.json(category);
        } catch {
            res.status(500).json({ message: 'Erreur serveur.' });
        }
    }
);

// DELETE /api/prices/olives/:id - Owner Only (Delete Category)
router.delete(
    '/olives/:id',
    authenticate,
    ownerOnly,
    async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const category = await OliveCategory.findByIdAndDelete(req.params.id);
            if (!category) {
                res.status(404).json({ message: 'Catégorie introuvable.' });
                return;
            }
            res.json({ message: 'Catégorie supprimée avec succès.' });
        } catch {
            res.status(500).json({ message: 'Erreur serveur.' });
        }
    }
);

// --- Pressing Services ---

// GET /api/prices/pressing - Public
router.get('/pressing', async (req, res) => {
    try {
        const services = await PressingService.find({ active: true });
        res.json(services);
    } catch {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

// POST /api/prices/pressing - Owner Only
router.post(
    '/pressing',
    authenticate,
    ownerOnly,
    [
        body('name').notEmpty().withMessage('Le nom est requis'),
        body('category').isIn(['extra_virgin', 'virgin', 'third_quality']).withMessage('Catégorie invalide'),
        body('fee').isNumeric().withMessage('Le frais doit être un nombre'),
        body('yield_per_kg').optional().isNumeric().withMessage('Le rendement doit être un nombre'),
    ],
    async (req: AuthRequest, res: Response): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
        try {
            const service = await PressingService.create(req.body);
            res.status(201).json(service);
        } catch (error: any) {
            if (error.code === 11000) {
                res.status(400).json({ message: 'Ce service existe déjà.' });
                return;
            }
            res.status(500).json({ message: 'Erreur serveur.' });
        }
    }
);

// PATCH /api/prices/pressing/:id - Owner Only (Update Fee)
router.patch(
    '/pressing/:id',
    authenticate,
    ownerOnly,
    [
        body('name').optional().notEmpty().withMessage('Le nom ne peut pas être vide'),
        body('category').optional().isIn(['extra_virgin', 'virgin', 'third_quality']).withMessage('Catégorie invalide'),
        body('fee').optional().isNumeric().withMessage('Le frais doit être un nombre'),
        body('yield_per_kg').optional().isNumeric().withMessage('Le rendement doit être un nombre'),
        body('active').optional().isBoolean().withMessage('Actif doit être un booléen'),
    ],
    async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const service = await PressingService.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!service) {
                res.status(404).json({ message: 'Service introuvable.' });
                return;
            }
            res.json(service);
        } catch {
            res.status(500).json({ message: 'Erreur serveur.' });
        }
    }
);

// DELETE /api/prices/pressing/:id - Owner Only (Delete Service)
router.delete(
    '/pressing/:id',
    authenticate,
    ownerOnly,
    async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const service = await PressingService.findByIdAndDelete(req.params.id);
            if (!service) {
                res.status(404).json({ message: 'Service introuvable.' });
                return;
            }
            res.json({ message: 'Service supprimé avec succès.' });
        } catch {
            res.status(500).json({ message: 'Erreur serveur.' });
        }
    }
);

export default router;
