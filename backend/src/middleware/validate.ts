import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

export const validate = (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    next();
};

export const createElectionValidation = [
    body('name').notEmpty().withMessage('Name is required'),
    body('startTime').isISO8601().withMessage('Invalid start time'),
    body('endTime').isISO8601().withMessage('Invalid end time'),
    body('candidates').isArray({ min: 2 }).withMessage('At least 2 candidates required'),
    validate
];

export const commitVoteValidation = [
    body('electionId').notEmpty().withMessage('Election ID is required'),
    body('commit').notEmpty().withMessage('Commit hash is required'),
    validate
];

export const revealVoteValidation = [
    body('electionId').notEmpty().withMessage('Election ID is required'),
    body('candidateId').isInt({ min: 0 }).withMessage('Invalid candidate ID'),
    body('salt').notEmpty().withMessage('Salt is required'),
    validate
];

