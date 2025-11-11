import { LedgerFactory } from '../src/services/LedgerFactory';
import { MerkleTree } from '../src/utils/merkle';
import { hashAddress } from '../src/utils/crypto';

describe('Smoke Tests', () => {
    test('Merkle tree creation and verification', () => {
        const addresses = [
            '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
            '0x1C5D0C3B7A8D9E0F1A2B3C4D5E6F7A8B9C0D1E2F'
        ];
        
        const leaves = addresses.map(addr => hashAddress(addr.toLowerCase()));
        const tree = new MerkleTree(leaves);
        const root = tree.getRoot();
        
        expect(root).toBeDefined();
        expect(root.length).toBe(64); // SHA256 hex string length
        
        const proof = tree.getProof(leaves[0]);
        expect(proof).toBeDefined();
        
        const isValid = MerkleTree.verifyProof(leaves[0], proof, root);
        expect(isValid).toBe(true);
    });

    test('Ledger factory creates ledger instance', () => {
        process.env.LEDGER_TYPE = 'EVM';
        const ledger = LedgerFactory.createLedger();
        expect(ledger).toBeDefined();
    });
});

