/**
 * PRESSING ROUTES
 * Handles requests from customers who bring their own olives to be pressed into oil.
 */

import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { PressingRequest } from '../models/PressingRequest';
import { Notification } from '../models/Notification';
import { User } from '../models/User';
import { authenticate, ownerOnly, AuthRequest } from '../middleware/auth';
import { sendPressingConfirmationEmail } from '../utils/sendEmail';
import crypto from 'crypto';

const router = Router();

/**
 * [ADMIN] View all pressing requests
 * Shows the owner a list of all customers waiting to have their olives pressed.
 */
router.get('/', authenticate, ownerOnly, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const requests = await PressingRequest.find({ is_archived: false })
            .populate('user_id', 'first_name last_name email phone is_blacklisted')
            .sort({ created_at: -1 });
        res.json(requests);
    } catch {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

/**
 * [CUSTOMER] View my own requests
 * Allows a customer to track the status of the olives they brought in.
 */
router.get('/my', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const requests = await PressingRequest.find({ user_id: req.user!.id }).sort({ created_at: -1 });
        res.json(requests);
    } catch {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

/**
 * [CUSTOMER] Submit a new pressing request
 * When a customer announces they are bringing olives to the mill.
 */
router.post(
    '/',
    authenticate,
    [
        // Validation: ensures the data is realistic
        body('olive_quantity_kg').isNumeric().withMessage('Quantité invalide'),
        body('oil_quality').isIn(['extra_virgin', 'virgin', 'third_quality']),
        body('payment.type').isIn(['money', 'olives']),
    ],
    async (req: AuthRequest, res: Response): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        try {
            const { olive_quantity_kg, oil_quality, yield: yieldData, payment, bring_olives_date, collect_oil_date } = req.body;

            // Business Rule: We don't accept small batches under 50kg
            if (olive_quantity_kg < 50) {
                res.status(400).json({ message: 'La quantité minimale est de 50 kg.' });
                return;
            }

            const tracking_code = crypto.randomBytes(3).toString('hex').toUpperCase();

            // Create the record in the database
            const request = await PressingRequest.create({
                user_id: req.user!.id,
                olive_quantity_kg,
                oil_quality,
                yield: {
                    liters_per_kg: yieldData.liters_per_kg,
                    produced_oil_liters: yieldData.produced_oil_liters,
                },
                payment: {
                    type: payment.type,
                    pressing_price_per_kg: payment.pressing_price_per_kg,
                    percentage_taken: payment.percentage_taken,
                },
                tracking_code,
                status: 'pending',
                bring_olives_date: bring_olives_date ? new Date(bring_olives_date) : undefined,
                collect_oil_date: collect_oil_date ? new Date(collect_oil_date) : undefined,
            });

            // Send confirmation email asynchronously
            (async () => {
                try {
                    const user = await User.findById(req.user!.id);
                    if (user && user.email) {
                        await sendPressingConfirmationEmail(user.email, {
                            tracking_code,
                            quantity: olive_quantity_kg,
                            quality: oil_quality
                        });
                    }
                } catch (err) {
                    console.error('Pressing confirmation email error:', err);
                }
            })();

            res.status(201).json(request);
        } catch (error) {
            console.error('Pressing request error:', error);
            res.status(500).json({ message: 'Erreur serveur.' });
        }
    }
);

/**
 * [ADMIN] Update Request Status
 * Move request from 'pending' to 'accepted', 'completed', etc.
 */
router.patch(
    '/:id/status',
    authenticate,
    ownerOnly,
    async (req: AuthRequest, res: Response): Promise<void> => {
        const { status } = req.body;
        const valid = ['pending', 'accepted', 'rejected', 'completed'];
        if (!valid.includes(status)) {
            res.status(400).json({ message: 'Statut invalide.' });
            return;
        }
        try {
            const request = await PressingRequest.findByIdAndUpdate(
                req.params.id,
                { status },
                { new: true }
            );
            if (!request) {
                res.status(404).json({ message: 'Demande introuvable.' });
                return;
            }

            // Notify the customer that the mill is ready for them
            await Notification.create({
                user_id: request.user_id,
                pressing_id: request._id,
                title: 'Mise à jour de votre demande de pressage',
                message: `Le statut de votre demande de pressage est maintenant : ${status}.`,
            });

            res.json(request);
        } catch {
            res.status(500).json({ message: 'Erreur serveur.' });
        }
    }
);

/**
 * [ADMIN] Schedule Appointment
 * Specifically set when the customer should bring olives and when they can get the oil.
 */
router.patch(
    '/:id/appointment',
    authenticate,
    ownerOnly,
    [
        body('bring_olives_date').optional().isISO8601(),
        body('collect_oil_date').optional().isISO8601()
    ],
    async (req: AuthRequest, res: Response): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        try {
            const updateFields: any = {};
            if (req.body.bring_olives_date) updateFields.bring_olives_date = new Date(req.body.bring_olives_date);
            if (req.body.collect_oil_date) updateFields.collect_oil_date = new Date(req.body.collect_oil_date);

            const request = await PressingRequest.findByIdAndUpdate(
                req.params.id,
                updateFields,
                { new: true }
            );

            if (!request) {
                res.status(404).json({ message: 'Demande introuvable.' });
                return;
            }

            // Create notification with the new dates
            let datesMessage = '';
            if (req.body.bring_olives_date) datesMessage += `\nApport des olives : ${new Date(req.body.bring_olives_date).toLocaleDateString()}`;
            if (req.body.collect_oil_date) datesMessage += `\nRécupération d'huile : ${new Date(req.body.collect_oil_date).toLocaleDateString()}`;

            await Notification.create({
                user_id: request.user_id,
                pressing_id: request._id,
                title: 'Dates de pressage programmées',
                message: `Vos dates ont été fixées : ${datesMessage}`,
            });

            res.json(request);
        } catch {
            res.status(500).json({ message: 'Erreur serveur.' });
        }
    }
);

/**
 * ARCHIVE AND DELETE
 */
router.get('/archived', authenticate, ownerOnly, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const requests = await PressingRequest.find({ is_archived: true })
            .populate('user_id', 'first_name last_name email phone is_blacklisted')
            .sort({ updated_at: -1 });
        res.json(requests);
    } catch {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

router.patch('/:id/archive', authenticate, ownerOnly, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const request = await PressingRequest.findByIdAndUpdate(req.params.id, { is_archived: true }, { new: true });
        if (!request) {
            res.status(404).json({ message: 'Demande introuvable.' });
            return;
        }
        res.json(request);
    } catch {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

router.delete('/:id', authenticate, ownerOnly, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const request = await PressingRequest.findByIdAndDelete(req.params.id);
        if (!request) {
            res.status(404).json({ message: 'Demande introuvable.' });
            return;
        }
        res.json({ message: 'Demande supprimée.' });
    } catch {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

export default router;
