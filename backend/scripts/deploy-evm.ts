import { execSync } from 'child_process';
import { logger } from '../src/utils/logger';

async function deploy() {
    try {
        logger.info('Deploying EVM contracts...');
        
        // Change to contracts directory
        process.chdir('./contracts/evm');
        
        // Compile contracts
        logger.info('Compiling contracts...');
        execSync('npx truffle compile', { stdio: 'inherit' });
        
        // Deploy to Ganache
        logger.info('Deploying to Ganache...');
        const output = execSync('npx truffle migrate --network ganache', { 
            encoding: 'utf-8',
            stdio: 'pipe'
        });
        
        // Extract contract address from output
        const addressMatch = output.match(/Voting:\s+(0x[a-fA-F0-9]{40})/);
        if (addressMatch) {
            logger.info(`Contract deployed at: ${addressMatch[1]}`);
            logger.info(`Add this to your .env file: EVM_CONTRACT_ADDRESS=${addressMatch[1]}`);
        }
        
        process.exit(0);
    } catch (error: any) {
        logger.error('Error deploying contracts:', error);
        process.exit(1);
    }
}

deploy();

