import { Router } from 'express';
import {
    commitVote,
    revealVote,
    getReceipt
} from '../controllers/vote.controller';
import { authenticate } from '../middleware/auth';
import { commitVoteValidation, revealVoteValidation } from '../middleware/validate';

const router = Router();

router.post('/commit', authenticate, commitVoteValidation, commitVote);
router.post('/reveal', authenticate, revealVoteValidation, revealVote);
router.get('/receipt/:txHash', getReceipt);

export default router;

