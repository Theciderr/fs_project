import { Response } from 'express';
import Election from '../models/Election';
import Eligibility from '../models/Eligibility';
import AuditLog from '../models/AuditLog';
import { LedgerFactory } from '../services/LedgerFactory';
import { hashCommit, verifyCommit } from '../utils/crypto';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

export async function commitVote(req: AuthRequest, res: Response): Promise<void> {
    try {
        const { electionId, commit } = req.body;
        const voterAddress = req.user?.address;

        if (!voterAddress) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        const election = await Election.findById(electionId);
        if (!election) {
            res.status(404).json({ error: 'Election not found' });
            return;
        }

        if (election.status !== 'open') {
            res.status(400).json({ error: 'Election is not open for voting' });
            return;
        }

        // Check eligibility
        const eligibility = await Eligibility.findOne({
            electionId: election._id,
            address: voterAddress.toLowerCase()
        });

        if (!eligibility) {
            res.status(403).json({ error: 'Not eligible to vote in this election' });
            return;
        }

        if (!election.ledgerElectionId) {
            res.status(400).json({ error: 'Election not deployed to ledger' });
            return;
        }

        // Commit vote on ledger
        const ledger = LedgerFactory.createLedger();
        const receipt = await ledger.commitVote(
            election.ledgerElectionId,
            voterAddress,
            commit
        );

        // Log audit
        await AuditLog.create({
            electionId: election._id,
            action: 'vote_committed',
            actor: voterAddress,
            txHash: receipt.txHash,
            details: { commit, receipt }
        });

        res.json({ receipt, message: 'Vote committed successfully' });
    } catch (error: any) {
        logger.error('Error committing vote:', error);
        res.status(500).json({ error: error.message });
    }
}

export async function revealVote(req: AuthRequest, res: Response): Promise<void> {
    try {
        const { electionId, candidateId, salt } = req.body;
        const voterAddress = req.user?.address;

        if (!voterAddress) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        const election = await Election.findById(electionId);
        if (!election) {
            res.status(404).json({ error: 'Election not found' });
            return;
        }

        if (election.status !== 'closed') {
            res.status(400).json({ error: 'Election must be closed before revealing votes' });
            return;
        }

        if (!election.ledgerElectionId) {
            res.status(400).json({ error: 'Election not deployed to ledger' });
            return;
        }

        // Verify commit matches
        const commit = hashCommit(candidateId, salt);
        
        // Reveal vote on ledger
        const ledger = LedgerFactory.createLedger();
        const receipt = await ledger.revealVote(
            election.ledgerElectionId,
            voterAddress,
            candidateId,
            salt
        );

        // Log audit
        await AuditLog.create({
            electionId: election._id,
            action: 'vote_revealed',
            actor: voterAddress,
            txHash: receipt.txHash,
            details: { candidateId, receipt }
        });

        res.json({ receipt, message: 'Vote revealed successfully' });
    } catch (error: any) {
        logger.error('Error revealing vote:', error);
        res.status(500).json({ error: error.message });
    }
}

export async function getReceipt(req: Request, res: Response): Promise<void> {
    try {
        const { txHash } = req.params;
        
        const auditLog = await AuditLog.findOne({ txHash }).populate('electionId');
        
        if (!auditLog) {
            res.status(404).json({ error: 'Receipt not found' });
            return;
        }

        res.json({
            txHash: auditLog.txHash,
            action: auditLog.action,
            electionId: auditLog.electionId,
            timestamp: auditLog.timestamp,
            details: auditLog.details
        });
    } catch (error: any) {
        logger.error('Error getting receipt:', error);
        res.status(500).json({ error: error.message });
    }
}

