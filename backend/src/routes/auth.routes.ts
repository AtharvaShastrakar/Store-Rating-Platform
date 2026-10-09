import { Router } from 'express';
import { signup, login, updatePassword, getMe } from '../controllers/auth.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { signupSchema, loginSchema, updatePasswordSchema } from '../schemas/auth.schema';
import { authRateLimiter } from '../middlewares/rateLimit.middleware';

const router = Router();

router.post('/signup', authRateLimiter, validateRequest({ body: signupSchema }), signup);
router.post('/login', authRateLimiter, validateRequest({ body: loginSchema }), login);
router.post('/update-password', authenticateToken, validateRequest({ body: updatePasswordSchema }), updatePassword);
router.get('/me', authenticateToken, getMe);

export default router;
