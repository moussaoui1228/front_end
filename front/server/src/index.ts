/**
 * MAIN SERVER FILE
 * This is the heart of the backend application. It sets up the Express server,
 * connects to the database, and defines all the routes (API endpoints).
 */

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors'; // Handles Cross-Origin Resource Sharing (security for web requests)
import dotenv from 'dotenv'; // Loads secret variables from the .env file
import path from 'path';
import rateLimit from 'express-rate-limit'; // Prevents spamming the API
import helmet from 'helmet'; // Adds security headers to prevent basic attacks
import mongoSanitize from 'express-mongo-sanitize'; // Prevents database injection attacks
const xss = require('xss-clean'); // Prevents malicious scripts from being injected
import hpp from 'hpp'; // Prevents parameter pollution in URLs

// Import all our route definitions
import authRoutes from './routes/auth';
import orderRoutes from './routes/orders';
import pressingRoutes from './routes/pressing';
import settingsRoutes from './routes/settings';
import shippingRatesRoutes from './routes/shippingRates';
import oilQualityRoutes from './routes/oilQuality';
import productRoutes from './routes/products';
import notificationRoutes from './routes/notifications';
import commentRoutes from './routes/comments';
import pricesRoutes from './routes/prices';
import userRoutes from './routes/users';

// Initialize environment variables
dotenv.config();

const app = express();
// The port where the server will listen (5000 by default or from configuration)
const PORT = process.env.PORT || 5000;

// ==========================================
// MIDDLEWARE SETUP
// Middleware are functions that run on every request
// ==========================================

// Allow requests from our frontend (Vite's default port or production domain)
app.use(cors({
    origin: [
        process.env.ALLOWED_ORIGIN || '',
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:8080',
        'http://127.0.0.1:8080'
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Allow the server to read JSON data sent in request bodies
app.use(express.json());

// SECURITY MIDDLEWARES
app.use(helmet()); // Basic security headers
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(xss()); // Filter out malicious HTML/JS
app.use(hpp()); // Prevent URL parameter pollution

// RATE LIMITING
// Limits how many requests a single IP address can make to prevent abuse
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Maximum 500 requests per 15 minutes
    message: { message: 'Trop de requêtes, veuillez réessayer dans 15 minutes.' }
});
app.use('/api', globalLimiter);

// CUSTOM LOGGING
// Prints information about every request to the terminal console
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// AUTH LIMITER
// Stricter limits for login/register to prevent brute-force attacks
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20, 
    message: { message: 'Trop de tentatives, veuillez réessayer plus tard.' }
});

// ==========================================
// ROUTE DEFINITIONS
// Mapping URLs to their specific logic files
// ==========================================
app.use('/api/auth', authLimiter, authRoutes); // Login, Register, Profile
app.use('/api/orders', orderRoutes); // Shopping orders
app.use('/api/pressing', pressingRoutes); // Olive pressing requests
app.use('/api/settings', settingsRoutes); // General site settings
app.use('/api/shipping-rates', shippingRatesRoutes); // Delivery prices
app.use('/api/oil-quality', oilQualityRoutes); // Oil types and yields
app.use('/api/products', productRoutes); // Store products (Olive oil bottles)
app.use('/api/notifications', notificationRoutes); // User alerts
app.use('/api/comments', commentRoutes); // User reviews/feedback
app.use('/api/prices', pricesRoutes); // Dynamic price management
app.use('/api/users', userRoutes); // Administrator user management

// SERVING THE FRONTEND
// In production, the backend also sends the HTML/JS for the website
if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, '../../dist');
    app.use(express.static(distPath));
    // Any URL that doesn't start with /api will serve the index.html file
    app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
    });
}

// Basic health check to see if the server is alive
app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date() }));
app.get('/api/test-cors', (_, res) => res.json({ message: 'CORS works!' }));

// ==========================================
// DATABASE CONNECTION & START
// ==========================================
mongoose
    .connect(process.env.MONGODB_URI as string)
    .then(() => {
        console.log('✅ Connected to MongoDB');
        const portNum = Number(PORT);
        // Start listening for incoming traffic
        app.listen(portNum, '0.0.0.0', () => {
            console.log(`🚀 Server running on port ${portNum}`);
        });
    })
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err.message);
        process.exit(1); // Kill the server if database connection fails
    });


