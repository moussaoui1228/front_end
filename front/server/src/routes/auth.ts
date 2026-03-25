import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../models/User';
import { sendResetEmail } from '../utils/sendEmail';

const router = Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// POST /api/auth/register
router.post(
    '/register',
    [
        body('first_name').notEmpty().withMessage('Le prénom est requis'),
        body('last_name').notEmpty().withMessage('Le nom est requis'),
        body('email').isEmail().withMessage('Email invalide'),
        body('phone').notEmpty().withMessage('Le téléphone est requis'),
        body('password').isLength({ min: 6 }).withMessage('Mot de passe trop court (min 6 caractères)'),
    ],
    async (req: any, res: Response): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const { first_name, last_name, email, phone, password, role } = req.body;

        try {
            const existing = await User.findOne({ email });
            if (existing) {
                res.status(409).json({ message: 'Un compte avec cet email existe déjà.' });
                return;
            }

            const hashed = await bcrypt.hash(password, 12);
            const user = await User.create({
                first_name,
                last_name,
                email,
                phone,
                password: hashed,
                role: 'customer', // Always 'customer' to prevent privilege escalation
            });

            const token = jwt.sign(
                { id: user._id, role: user.role, is_subscribed: user.is_subscribed },
                process.env.JWT_SECRET as string,
                { expiresIn: '7d' }
            );

            res.status(201).json({
                token,
                user: {
                    _id: user._id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    is_subscribed: user.is_subscribed,
                },
            });
        } catch (err) {
            res.status(500).json({ message: 'Erreur serveur.' });
        }
    }
);

// POST /api/auth/login
router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Email invalide'),
        body('password').notEmpty().withMessage('Mot de passe requis'),
    ],
    async (req: any, res: Response): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const { email, password } = req.body;

        try {
            const user = await User.findOne({ email });
            if (!user) {
                res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
                return;
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
                return;
            }

            const token = jwt.sign(
                { id: user._id, role: user.role, is_subscribed: user.is_subscribed },
                process.env.JWT_SECRET as string,
                { expiresIn: '7d' }
            );

            res.json({
                token,
                user: {
                    _id: user._id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    is_subscribed: user.is_subscribed,
                },
            });
        } catch (err) {
            res.status(500).json({ message: 'Erreur serveur.' });
        }
    }
);

// POST /api/auth/google
router.post(
    '/google',
    [body('credential').notEmpty().withMessage('Token Google manquant')],
    async (req: any, res: Response): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const { credential } = req.body;

        try {
            // Very Google ID Token
            const ticket = await googleClient.verifyIdToken({
                idToken: credential,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            
            if (!payload || !payload.email) {
                res.status(400).json({ message: 'Token Google invalide' });
                return;
            }

            const { email, given_name, family_name } = payload;

            // Check if user exists
            let user = await User.findOne({ email });

            // Create user if they don't exist
            if (!user) {
                // Generate a random unused password for standard auth compatibility
                const randomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
                const hashed = await bcrypt.hash(randomPassword, 12);
                
                user = await User.create({
                    first_name: given_name || 'Utilisateur',
                    last_name: family_name || 'Google',
                    email,
                    phone: '0000000000', // Default phone number since Google doesn't provide it
                    password: hashed,
                    role: 'customer',
                });
            }

            // Generate JWT
            const token = jwt.sign(
                { id: user._id, role: user.role, is_subscribed: user.is_subscribed },
                process.env.JWT_SECRET as string,
                { expiresIn: '7d' }
            );

            res.json({
                token,
                user: {
                    _id: user._id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    is_subscribed: user.is_subscribed,
                },
            });
        } catch (err) {
            console.error('[AUTH] Google Auth Error:', err);
            res.status(500).json({ message: 'Erreur lors de la connexion avec Google.' });
        }
    }
);

// POST /api/auth/forgot-password
router.post(
    '/forgot-password',
    [body('email').isEmail().withMessage('Email invalide')],
    async (req: any, res: Response): Promise<void> => {
        const { email } = req.body;
        console.log('\n' + '🔵'.repeat(30));
        console.log(`[AUTH] REQUÊTE REÇUE pour: ${email}`);
        console.log('🔵'.repeat(30) + '\n');
        try {
            const user = await User.findOne({ email });
            console.log(`[AUTH] Forgot password request for: ${email}`);
            if (!user) {
                console.log(`[AUTH] User not found: ${email}`);
                // For security, don't reveal if user exists or not
                res.json({ message: 'Si cet email est enregistré, un code de vérification a été envoyé.' });
                return;
            }

            const code = Math.floor(100000 + Math.random() * 900000).toString();
            user.reset_password_code = code;
            user.reset_password_expires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
            await user.save();

            // Send email
            try {
                await sendResetEmail(email, code);
                console.log('\x1b[32m%s\x1b[0m', `[AUTH] Email envoyé à ${email}`);
            } catch (mailError: any) {
                console.error('\x1b[31m%s\x1b[0m', `[AUTH-ERROR] Échec de l'envoi à ${email}:`, mailError.message);
                console.log('\x1b[33m%s\x1b[0m', `[AUTH-FALLBACK] Utilisez ce code pour tester: ${code}`);
            }

            res.json({ message: 'Si cet email est enregistré, un code de vérification a été envoyé.' });
        } catch (err) {
            res.status(500).json({ message: 'Erreur serveur.' });
        }
    }
);

// POST /api/auth/reset-password
router.post(
    '/reset-password',
    [
        body('email').isEmail().withMessage('Email invalide'),
        body('code').notEmpty().withMessage('Code requis'),
        body('newPassword').isLength({ min: 6 }).withMessage('Nouveau mot de passe trop court'),
    ],
    async (req: any, res: Response): Promise<void> => {
        const { email, code, newPassword } = req.body;
        try {
            const user = await User.findOne({
                email,
                reset_password_code: code,
                reset_password_expires: { $gt: new Date() },
            });

            if (!user) {
                res.status(400).json({ message: 'Code invalide ou expiré.' });
                return;
            }

            user.password = await bcrypt.hash(newPassword, 12);
            user.reset_password_code = undefined;
            user.reset_password_expires = undefined;
            await user.save();

            res.json({ message: 'Mot de passe mis à jour avec succès.' });
        } catch (err) {
            res.status(500).json({ message: 'Erreur serveur.' });
        }
    }
);

export default router;
