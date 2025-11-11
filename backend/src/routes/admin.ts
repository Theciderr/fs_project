import { Router } from 'express';
import multer from 'multer';
import {
    uploadEligibility,
    getAuditLogs,
    getDashboard
} from '../controllers/admin.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/dashboard', authenticate, requireAdmin, getDashboard);
router.post('/eligibility', authenticate, requireAdmin, upload.single('file'), uploadEligibility);
router.get('/audit/:electionId', authenticate, requireAdmin, getAuditLogs);

export default router;

