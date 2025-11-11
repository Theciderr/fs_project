import { ILedger } from './ledger/abstraction/ILedger';
import { EvmLedger } from './ledger/evm/EvmLedger';
import { FabricLedger } from './ledger/fabric/FabricLedger';
import { logger } from '../utils/logger';

export class LedgerFactory {
    static createLedger(): ILedger {
        const ledgerType = process.env.LEDGER_TYPE || 'EVM';
        
        logger.info(`Creating ledger instance: ${ledgerType}`);
        
        switch (ledgerType.toUpperCase()) {
            case 'EVM':
                return new EvmLedger();
            case 'FABRIC':
                return new FabricLedger();
            default:
                throw new Error(`Unsupported ledger type: ${ledgerType}`);
        }
    }
}

