import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { Comment } from '../models/Comment';
import { User } from '../models/User';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/comments - Get all comments
router.get('/', async (req, res) => {
    try {
        const comments = await Comment.find()
            .populate('user_id', 'first_name last_name')
            .sort({ created_at: -1 });
        res.json(comments);
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la récupération des commentaires.' });
    }
});

router.post(
    '/',
    authenticate,
    [
        body('content').notEmpty().withMessage('Le contenu du commentaire est requis'),
        body('rating').isInt({ min: 1, max: 5 }).withMessage('La note doit être entre 1 et 5'),
    ],
    async (req: any, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        try {
            const comment = await Comment.create({
                user_id: req.user!.id,
                content: req.body.content,
                rating: req.body.rating || 5,
            });
            const populatedComment = await comment.populate('user_id', 'first_name last_name');
            res.status(201).json(populatedComment);
        } catch (err) {
            res.status(500).json({ message: 'Erreur lors de la création du commentaire.' });
        }
    }
);

// DELETE /api/comments/:id - Delete a comment
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            res.status(404).json({ message: 'Commentaire non trouvé.' });
            return;
        }

        // Check ownership: only the author or an owner can delete
        if (comment.user_id.toString() !== req.user!.id && req.user!.role !== 'owner') {
            res.status(403).json({ message: 'Opération non autorisée.' });
            return;
        }

        await comment.deleteOne();
        res.json({ message: 'Commentaire supprimé.' });
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la suppression.' });
    }
});

export default router;
