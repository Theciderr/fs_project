import { Gateway, Wallets, Network } from 'fabric-network';
import * as fs from 'fs';
import * as path from 'path';
import { logger } from '../../../utils/logger';

let gateway: Gateway | null = null;

export async function getGateway(): Promise<Gateway> {
    if (gateway) {
        return gateway;
    }

    const walletPath = process.env.FABRIC_WALLET_PATH || './wallet';
    const networkConfigPath = process.env.FABRIC_NETWORK_CONFIG_PATH || './network-config.json';
    const userId = process.env.FABRIC_USER_ID || 'admin';

    try {
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        const userExists = await wallet.get(userId);
        
        if (!userExists) {
            throw new Error(`User ${userId} does not exist in wallet`);
        }

        gateway = new Gateway();
        const connectionProfile = JSON.parse(fs.readFileSync(networkConfigPath, 'utf8'));
        const connectionOptions = {
            wallet,
            identity: userId,
            discovery: { enabled: true, asLocalhost: true }
        };

        await gateway.connect(connectionProfile, connectionOptions);
        logger.info('Connected to Hyperledger Fabric network');
        return gateway;
    } catch (error: any) {
        logger.error('Error connecting to Fabric:', error);
        throw new Error(`Failed to connect to Fabric: ${error.message}`);
    }
}

export async function getNetwork(): Promise<Network> {
    const gateway = await getGateway();
    const channelName = process.env.FABRIC_CHANNEL_NAME || 'mychannel';
    return await gateway.getNetwork(channelName);
}

export async function getContract() {
    const network = await getNetwork();
    const chaincodeName = process.env.FABRIC_CHAINCODE_NAME || 'voting';
    return network.getContract(chaincodeName);
}

export async function disconnect() {
    if (gateway) {
        await gateway.disconnect();
        gateway = null;
    }
}

