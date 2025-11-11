import { randomBytes } from 'crypto';
import { keccak256, encodePacked } from 'web3-utils';
import Web3 from 'web3';

const web3 = new Web3();

export function generateSalt(): string {
    return randomBytes(32).toString('hex');
}

export function hashCommit(candidateId: number, salt: string): string {
    // Match Solidity: keccak256(abi.encode(candidateId, salt))
    // abi.encode pads each parameter to 32 bytes
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
        // uint256: 32 bytes, big-endian
        const candidateBN = web3.utils.toBN(candidateId);
        const candidateHex = candidateBN.toString(16).padStart(64, '0');
        // bytes32: 32 bytes
        const saltHex = salt.startsWith('0x') ? salt.slice(2) : salt;
        const saltPadded = saltHex.padStart(64, '0');
        // Concatenate (abi.encode just concatenates padded values)
        const combined = '0x' + candidateHex + saltPadded;
        return keccak256(combined).slice(2);
    }
}

export function verifyCommit(candidateId: number, salt: string, commit: string): boolean {
    const computed = hashCommit(candidateId, salt);
    const commitClean = commit.startsWith('0x') ? commit.slice(2) : commit;
    return computed.toLowerCase() === commitClean.toLowerCase();
}

export function hashAddress(address: string): string {
    // Match Solidity: keccak256(abi.encodePacked(address))
    // address is 20 bytes, encodePacked will use exactly 20 bytes
    const packed = encodePacked({ value: address.toLowerCase(), type: 'address' }) || '';
    return keccak256(packed).slice(2).toLowerCase(); // Remove '0x' prefix
}
