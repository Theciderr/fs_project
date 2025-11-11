import { Router } from 'express';
import {
    createElection,
    getElections,
    getElection,
    closeElection,
    getTally
} from '../controllers/election.controller';
import { authenticate, requireAdmin } from '../middleware/auth';
import { createElectionValidation } from '../middleware/validate';

const router = Router();

router.get('/', getElections);
router.get('/:id', getElection);
router.get('/:id/tally', getTally);
router.post('/', authenticate, requireAdmin, createElectionValidation, createElection);
router.post('/:id/close', authenticate, requireAdmin, closeElection);

export default router;

