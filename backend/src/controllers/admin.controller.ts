import { Response } from 'express';
import mongoose from 'mongoose';
import Eligibility from '../models/Eligibility';
import AuditLog from '../models/AuditLog';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';
import { parse } from 'csv-parse/sync';

export async function uploadEligibility(req: AuthRequest, res: Response): Promise<void> {
    try {
        const file = req.file;
        
        if (!file) {
            res.status(400).json({ error: 'No file uploaded' });
            return;
        }

        const csvContent = file.buffer.toString('utf-8');
        const records = parse(csvContent, {
            columns: true,
            skip_empty_lines: true
        });

        const eligibilityRecords = records.map((record: any) => ({
            address: record.address?.toLowerCase().trim(),
            voterId: record.voterId || record.voter_id || ''
        })).filter((record: any) => record.address);

        // Save eligibility records (without electionId - will be assigned when election is created)
        for (const record of eligibilityRecords) {
            await Eligibility.findOneAndUpdate(
                { address: record.address },
                { address: record.address, voterId: record.voterId },
                { upsert: true, new: true }
            );
        }

        // Log audit (eligibility upload doesn't require an electionId)
        // We'll use a placeholder ObjectId for eligibility uploads
        const placeholderId = new mongoose.Types.ObjectId();
        await AuditLog.create({
            electionId: placeholderId,
            action: 'eligibility_uploaded',
            actor: req.user?.address || 'admin',
            details: { count: eligibilityRecords.length }
        });

        res.json({ 
            message: 'Eligibility list uploaded successfully',
            count: eligibilityRecords.length
        });
    } catch (error: any) {
        logger.error('Error uploading eligibility:', error);
        res.status(500).json({ error: error.message });
    }
}

export async function getAuditLogs(req: AuthRequest, res: Response): Promise<void> {
    try {
        const { electionId } = req.params;
        
        const logs = await AuditLog.find({ electionId })
            .sort({ timestamp: -1 })
            .limit(100);
        
        res.json(logs);
    } catch (error: any) {
        logger.error('Error getting audit logs:', error);
        res.status(500).json({ error: error.message });
    }
}

export async function getDashboard(req: AuthRequest, res: Response): Promise<void> {
    try {
        const elections = await Election.find().sort({ createdAt: -1 }).limit(10);
        const totalElections = await Election.countDocuments();
        const totalEligible = await Eligibility.countDocuments();
        
        const stats = {
            totalElections,
            totalEligible,
            recentElections: elections
        };
        
        res.json(stats);
    } catch (error: any) {
        logger.error('Error getting dashboard:', error);
        res.status(500).json({ error: error.message });
    }
}

