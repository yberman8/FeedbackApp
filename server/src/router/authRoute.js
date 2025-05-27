import express from 'express'
import AuthController from '../../src/controllers/AuthController.js';
import authToken from '../middleware/authToken.js';
import rateLimit from 'express-rate-limit';
const router = express.Router();

// Define a rate limiting middleware
const limiter = rateLimit({
    windowMs: 30 * 60 * 1000, // half hour in milliseconds
    max: 10, // 10 requests per windowMs
    handler: (req, res) => {
        // Customize the response as JSON
        res.status(400).json({ message: 'Too many request from this IP, please try again later.' });
    },
});

// בקשות API
router.post('/login', limiter, AuthController.Login);
// router.post('/forgotPassword', limiter, AuthController.forgotPassword);
// router.put('/resetPassword', authToken, limiter, AuthController.resetPassword);

export default router;