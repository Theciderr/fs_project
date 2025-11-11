import Web3 from 'web3';
import { logger } from '../../../utils/logger';

const RPC_URL = process.env.EVM_RPC_URL || 'http://localhost:8545';
const PRIVATE_KEY = process.env.EVM_PRIVATE_KEY || '';

let web3Instance: Web3 | null = null;

export function getWeb3(): Web3 {
    if (!web3Instance) {
        web3Instance = new Web3(RPC_URL);
        logger.info(`Connected to EVM at ${RPC_URL}`);
    }
    return web3Instance;
}

export function getAccount() {
    if (!PRIVATE_KEY) {
        throw new Error('EVM_PRIVATE_KEY not set in environment variables');
    }
    const web3 = getWeb3();
    const account = web3.eth.accounts.privateKeyToAccount('0x' + PRIVATE_KEY);
    return account;
}

export function getContractAddress(): string {
    const address = process.env.EVM_CONTRACT_ADDRESS;
    if (!address) {
        throw new Error('EVM_CONTRACT_ADDRESS not set in environment variables');
    }
    return address;
}

