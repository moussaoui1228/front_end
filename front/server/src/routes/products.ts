import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { Product } from '../models/Product';
import { authenticate, ownerOnly, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/products - Get all available products
router.get('/', async (req: any, res: Response) => {
    try {
        const products = await Product.find({ is_available: true });
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la récupération des produits.' });
    }
});

// POST /api/products - Create a new product (Admin only)
router.post(
    '/',
    authenticate,
    ownerOnly,
    [
        body('name').notEmpty().withMessage('Le nom est requis'),
        body('category').isIn(['extra_virgin', 'virgin', 'third_quality']).withMessage('Catégorie invalide'),
        body('price_per_liter').isNumeric().withMessage('Le prix doit être un nombre'),
        body('stock_liters').isNumeric().withMessage('Le stock doit être un nombre'),
    ],
    async (req: AuthRequest, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const product = await Product.create(req.body);
            res.status(201).json(product);
        } catch (err) {
            res.status(500).json({ message: 'Erreur lors de la création du produit.' });
        }
    }
);

// PUT /api/products/:id - Update a product (Admin only)
router.put('/:id', authenticate, ownerOnly, async (req: AuthRequest, res: Response) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!product) return res.status(404).json({ message: 'Produit non trouvé' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la mise à jour du produit.' });
    }
});

// DELETE /api/products/:id - Delete a product (Admin only)
router.delete('/:id', authenticate, ownerOnly, async (req: AuthRequest, res: Response) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: 'Produit non trouvé' });
        res.json({ message: 'Produit supprimé avec succès' });
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la suppression du produit.' });
    }
});

export default router;
