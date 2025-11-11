import mongoose from 'mongoose';
import Eligibility from '../src/models/Eligibility';
import { connectDatabase } from '../src/config';
import { logger } from '../src/utils/logger';

async function seed() {
    try {
        await connectDatabase();

        // Sample eligibility data
        const sampleEligibility = [
            { address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', voterId: 'voter_001' },
            { address: '0x1C5D0C3B7A8D9E0F1A2B3C4D5E6F7A8B9C0D1E2F', voterId: 'voter_002' },
            { address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', voterId: 'voter_003' }
        ];

        for (const record of sampleEligibility) {
            await Eligibility.findOneAndUpdate(
                { address: record.address.toLowerCase() },
                { address: record.address.toLowerCase(), voterId: record.voterId },
                { upsert: true, new: true }
            );
        }

        logger.info(`Seeded ${sampleEligibility.length} eligibility records`);
        process.exit(0);
    } catch (error) {
        logger.error('Error seeding data:', error);
        process.exit(1);
    }
}

seed();

