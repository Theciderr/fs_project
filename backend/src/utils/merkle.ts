import { keccak256, encodePacked } from 'web3-utils';

export class MerkleTree {
    private leaves: string[] = [];
    private tree: string[][] = [];

    constructor(leaves: string[]) {
        // Leaves are already hashed addresses (hex strings)
        // Ensure they're properly formatted (64 hex chars, no 0x)
        this.leaves = leaves.map(leaf => {
            const hex = leaf.startsWith('0x') ? leaf.slice(2) : leaf;
            return hex.padStart(64, '0').toLowerCase();
        });
        this.buildTree();
    }

    private hashPair(left: string, right: string): string {
        // Match Solidity: keccak256(abi.encodePacked(left, right))
        // Order: smaller value first (lexicographic comparison matches Solidity's bytes32 comparison)
        const leftHex = left.startsWith('0x') ? left.slice(2) : left;
        const rightHex = right.startsWith('0x') ? right.slice(2) : right;
        const leftPadded = leftHex.padStart(64, '0').toLowerCase();
        const rightPadded = rightHex.padStart(64, '0').toLowerCase();
        
        let packed: string;
        if (leftPadded < rightPadded) {
            packed = encodePacked(
                { value: '0x' + leftPadded, type: 'bytes32' },
                { value: '0x' + rightPadded, type: 'bytes32' }
            ) || '';
        } else {
            packed = encodePacked(
                { value: '0x' + rightPadded, type: 'bytes32' },
                { value: '0x' + leftPadded, type: 'bytes32' }
            ) || '';
        }
        return keccak256(packed).slice(2).toLowerCase();
    }

    private buildTree(): void {
        this.tree = [this.leaves];

        let currentLevel = this.leaves;
        while (currentLevel.length > 1) {
            const nextLevel: string[] = [];
            for (let i = 0; i < currentLevel.length; i += 2) {
                const left = currentLevel[i];
                const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : left;
                nextLevel.push(this.hashPair(left, right));
            }
            this.tree.push(nextLevel);
            currentLevel = nextLevel;
        }
    }

    getRoot(): string {
        return this.tree[this.tree.length - 1][0];
    }

    getProof(leaf: string): string[] {
        // Ensure leaf is properly formatted
        const leafHex = leaf.startsWith('0x') ? leaf.slice(2) : leaf;
        const leafHash = leafHex.padStart(64, '0').toLowerCase();
        
        let index = this.leaves.indexOf(leafHash);
        
        if (index === -1) {
            throw new Error('Leaf not found in tree');
        }

        const proof: string[] = [];
        for (let level = 0; level < this.tree.length - 1; level++) {
            const isRight = index % 2 === 1;
            const siblingIndex = isRight ? index - 1 : index + 1;
            
            if (siblingIndex < this.tree[level].length) {
                proof.push(this.tree[level][siblingIndex]);
            } else {
                // If no sibling (odd number of nodes), duplicate the node
                proof.push(this.tree[level][index]);
            }
            
            index = Math.floor(index / 2);
        }

        return proof;
    }

    static verifyProof(leaf: string, proof: string[], root: string): boolean {
        // Ensure leaf is proper hex format
        let computed = leaf.startsWith('0x') ? leaf.slice(2) : leaf;
        computed = computed.padStart(64, '0').toLowerCase();

        // Match Solidity implementation
        for (const proofElement of proof) {
            const proofHex = proofElement.startsWith('0x') ? proofElement.slice(2) : proofElement;
            const proofPadded = proofHex.padStart(64, '0').toLowerCase();
            
            // Order: smaller value first (lexicographic comparison of hex strings)
            let packed: string;
            if (computed < proofPadded) {
                packed = encodePacked(
                    { value: '0x' + computed, type: 'bytes32' },
                    { value: '0x' + proofPadded, type: 'bytes32' }
                ) || '';
            } else {
                packed = encodePacked(
                    { value: '0x' + proofPadded, type: 'bytes32' },
                    { value: '0x' + computed, type: 'bytes32' }
                ) || '';
            }
            computed = keccak256(packed).slice(2).toLowerCase();
        }

        const rootClean = root.startsWith('0x') ? root.slice(2) : root;
        const rootPadded = rootClean.padStart(64, '0').toLowerCase();
        return computed === rootPadded;
    }
}
