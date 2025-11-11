import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from './middleware/rateLimit';
import electionRoutes from './routes/election';
import voteRoutes from './routes/vote';
import adminRoutes from './routes/admin';
import { logger } from './utils/logger';
import { connectDatabase, config } from './config';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(rateLimit);

app.use('/api/elections', electionRoutes);
app.use('/api/vote', voteRoutes);
app.use('/api/admin', adminRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

async function startServer() {
    try {
        await connectDatabase();
        
        const PORT = config.port;
        app.listen(PORT, () => {
            logger.info(`Backend running on port ${PORT}`);
            logger.info(`Environment: ${config.nodeEnv}`);
            logger.info(`Ledger type: ${config.ledgerType}`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();

export default app;

