import { Request, Response } from 'express';
import Election from '../models/Election';
import Eligibility from '../models/Eligibility';
import AuditLog from '../models/AuditLog';
import { LedgerFactory } from '../services/LedgerFactory';
import { MerkleTree } from '../utils/merkle';
import { hashAddress } from '../utils/crypto';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

export async function createElection(req: AuthRequest, res: Response): Promise<void> {
    try {
        const { name, description, startTime, endTime, candidates } = req.body;

        // Get eligibility list for this election
        const eligibilityList = await Eligibility.find({ electionId: null }).lean();
        const addresses = eligibilityList.map(e => e.address.toLowerCase());
        
        if (addresses.length === 0) {
            res.status(400).json({ error: 'No eligibility list found. Please upload eligibility list first.' });
            return;
        }

        // Build Merkle tree
        const leaves = addresses.map(addr => hashAddress(addr));
        const merkleTree = new MerkleTree(leaves);
        const eligibilityRoot = merkleTree.getRoot();

        // Create election on ledger
        const ledger = LedgerFactory.createLedger();
        const ledgerResult = await ledger.createElection({
            name,
            startTime: new Date(startTime).getTime() / 1000,
            endTime: new Date(endTime).getTime() / 1000,
            candidates,
            eligibilityRoot
        });

        // Determine initial status based on start time
        const now = new Date();
        const startDate = new Date(startTime);
        const initialStatus = startDate <= now ? 'open' : 'draft';

        // Save election to database
        const election = new Election({
            name,
            description,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            candidates,
            eligibilityRoot,
            ledgerElectionId: ledgerResult.electionId,
            status: initialStatus
        });
        await election.save();

        // Update eligibility records with proofs and electionId
        for (const elig of eligibilityList) {
            const proof = merkleTree.getProof(hashAddress(elig.address.toLowerCase()));
            await Eligibility.findByIdAndUpdate(elig._id, {
                electionId: election._id,
                proof
            });
        }

        // Log audit
        await AuditLog.create({
            electionId: election._id,
            action: 'election_created',
            actor: req.user?.address || 'system',
            details: { name, candidates, ledgerElectionId: ledgerResult.electionId }
        });

        res.status(201).json({ election, ledgerElectionId: ledgerResult.electionId });
    } catch (error: any) {
        logger.error('Error creating election:', error);
        res.status(500).json({ error: error.message });
    }
}

export async function getElections(req: Request, res: Response): Promise<void> {
    try {
        const elections = await Election.find().sort({ createdAt: -1 });
        res.json(elections);
    } catch (error: any) {
        logger.error('Error getting elections:', error);
        res.status(500).json({ error: error.message });
    }
}

export async function getElection(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        const election = await Election.findById(id);
        
        if (!election) {
            res.status(404).json({ error: 'Election not found' });
            return;
        }

        // Get ledger data if available
        if (election.ledgerElectionId) {
            try {
                const ledger = LedgerFactory.createLedger();
                const ledgerElection = await ledger.getElection(election.ledgerElectionId);
                res.json({ ...election.toObject(), ledgerData: ledgerElection });
            } catch (error) {
                res.json(election);
            }
        } else {
            res.json(election);
        }
    } catch (error: any) {
        logger.error('Error getting election:', error);
        res.status(500).json({ error: error.message });
    }
}

export async function closeElection(req: AuthRequest, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        const election = await Election.findById(id);
        
        if (!election) {
            res.status(404).json({ error: 'Election not found' });
            return;
        }

        if (!election.ledgerElectionId) {
            res.status(400).json({ error: 'Election not deployed to ledger' });
            return;
        }

        // Close on ledger
        const ledger = LedgerFactory.createLedger();
        const receipt = await ledger.closeElection(election.ledgerElectionId);

        // Update status
        election.status = 'closed';
        await election.save();

        // Log audit
        await AuditLog.create({
            electionId: election._id,
            action: 'election_closed',
            actor: req.user?.address || 'system',
            txHash: receipt.txHash,
            details: { receipt }
        });

        res.json({ election, receipt });
    } catch (error: any) {
        logger.error('Error closing election:', error);
        res.status(500).json({ error: error.message });
    }
}

export async function getTally(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        const election = await Election.findById(id);
        
        if (!election) {
            res.status(404).json({ error: 'Election not found' });
            return;
        }

        if (!election.ledgerElectionId) {
            res.status(400).json({ error: 'Election not deployed to ledger' });
            return;
        }

        const ledger = LedgerFactory.createLedger();
        const tally = await ledger.getTally(election.ledgerElectionId);

        // Map tally to candidates
        const results = tally.map(t => ({
            candidate: election.candidates[t.candidateId],
            candidateId: t.candidateId,
            votes: t.votes
        }));

        res.json({ election: election.name, results });
    } catch (error: any) {
        logger.error('Error getting tally:', error);
        res.status(500).json({ error: error.message });
    }
}

