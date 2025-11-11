// Cryptographic proof utilities for frontend
import { keccak256 } from 'web3-utils';
import Web3 from 'web3';

const web3 = new Web3();

export function generateSalt(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function hashCommit(candidateId: number, salt: string): string {
    // Match Solidity: keccak256(abi.encode(candidateId, salt))
    // Match backend implementation
    try {
        // Ensure salt is 32 bytes (64 hex chars)
        let saltHex = salt.startsWith('0x') ? salt.slice(2) : salt;
        saltHex = saltHex.padStart(64, '0');
        
        // Use web3's ABI encoder (matches Solidity's abi.encode)
        const encoded = web3.eth.abi.encodeParameters(
            ['uint256', 'bytes32'],
            [candidateId.toString(), '0x' + saltHex]
        );
        
        return keccak256(encoded).slice(2); // Remove '0x' prefix
    } catch (error) {
        // Fallback: manual encoding
        const candidateBN = web3.utils.toBN(candidateId);
        const candidateHex = candidateBN.toString(16).padStart(64, '0');
        const saltHex = salt.startsWith('0x') ? salt.slice(2) : salt;
        const saltPadded = saltHex.padStart(64, '0');
        const combined = '0x' + candidateHex + saltPadded;
        return keccak256(combined).slice(2);
    }
}

export function verifyCommit(candidateId: number, salt: string, commit: string): boolean {
    const computed = hashCommit(candidateId, salt);
    const commitClean = commit.startsWith('0x') ? commit.slice(2) : commit;
    return computed.toLowerCase() === commitClean.toLowerCase();
}

