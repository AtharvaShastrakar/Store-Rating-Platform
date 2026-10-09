import { Router } from 'express';
import { signup, login, updatePassword, getMe } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/update-password', authenticateToken, updatePassword);
router.get('/me', authenticateToken, getMe);

export default router;
