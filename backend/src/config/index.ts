import mongoose from 'mongoose';
import { logger } from '../utils/logger';

export async function connectDatabase(): Promise<void> {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/voting';
    
    try {
        await mongoose.connect(mongoUri);
        logger.info(`Connected to MongoDB: ${mongoUri}`);
    } catch (error: any) {
        logger.error('MongoDB connection error:', error);
        throw error;
    }
}

export const config = {
    port: process.env.PORT || 3001,
    nodeEnv: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET || 'secret',
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/voting',
    ledgerType: process.env.LEDGER_TYPE || 'EVM'
};

