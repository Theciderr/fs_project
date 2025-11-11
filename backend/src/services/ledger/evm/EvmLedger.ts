import { Contract } from 'web3-eth-contract';
import Web3 from 'web3';
import { getWeb3, getAccount, getContractAddress } from './web3';
import { ILedger, TxReceipt, TallyResult, CreateElectionParams, ElectionResult } from '../abstraction/ILedger';
import { logger } from '../../../utils/logger';

// Simplified ABI for Voting contract
const VOTING_ABI = [
    {
        inputs: [
            { name: 'name', type: 'string' },
            { name: 'startTime', type: 'uint256' },
            { name: 'endTime', type: 'uint256' },
            { name: 'candidateCount', type: 'uint256' },
            { name: 'eligibilityRoot', type: 'bytes32' }
        ],
        name: 'createElection',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            { name: 'electionId', type: 'uint256' },
            { name: 'commitHash', type: 'bytes32' }
        ],
        name: 'commitVote',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [
            { name: 'electionId', type: 'uint256' },
            { name: 'candidateId', type: 'uint256' },
            { name: 'salt', type: 'uint256' }
        ],
        name: 'revealVote',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [{ name: 'electionId', type: 'uint256' }],
        name: 'closeElection',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    {
        inputs: [{ name: 'electionId', type: 'uint256' }],
        name: 'getElection',
        outputs: [
            {
                components: [
                    { name: 'name', type: 'string' },
                    { name: 'startTime', type: 'uint256' },
                    { name: 'endTime', type: 'uint256' },
                    { name: 'candidateCount', type: 'uint256' },
                    { name: 'eligibilityRoot', type: 'bytes32' },
                    { name: 'closed', type: 'bool' }
                ],
                name: '',
                type: 'tuple'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            { name: 'electionId', type: 'uint256' },
            { name: 'candidateId', type: 'uint256' }
        ],
        name: 'getTally',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            { name: 'electionId', type: 'uint256' },
            { name: 'voter', type: 'address' },
            { name: 'proof', type: 'bytes32[]' }
        ],
        name: 'isEligible',
        outputs: [{ name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'electionCount',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
    }
];

export class EvmLedger implements ILedger {
    private web3: Web3;
    private contract: Contract;
    private account: any;

    constructor() {
        this.web3 = getWeb3();
        this.account = getAccount();
        const contractAddress = getContractAddress();
        this.contract = new this.web3.eth.Contract(VOTING_ABI as any, contractAddress);
        this.web3.eth.accounts.wallet.add(this.account);
    }

    async createElection(params: CreateElectionParams): Promise<ElectionResult> {
        try {
            // Ensure eligibilityRoot is 32 bytes (64 hex chars)
            let eligibilityRoot = params.eligibilityRoot.startsWith('0x') 
                ? params.eligibilityRoot.slice(2) 
                : params.eligibilityRoot;
            eligibilityRoot = eligibilityRoot.padStart(64, '0');
            eligibilityRoot = '0x' + eligibilityRoot;
            
            const tx = this.contract.methods.createElection(
                params.name,
                Math.floor(params.startTime),
                Math.floor(params.endTime),
                params.candidates.length,
                eligibilityRoot
            );

            const gas = await tx.estimateGas({ from: this.account.address });
            const receipt = await tx.send({
                from: this.account.address,
                gas: gas.toString()
            });

            // Try to get electionId from events or logs
            let electionId: string;
            if (receipt.events?.ElectionCreated?.returnValues?.id) {
                electionId = receipt.events.ElectionCreated.returnValues.id.toString();
            } else if (receipt.logs && receipt.logs.length > 0) {
                // Parse from logs if events not available
                const event = this.contract.options.jsonInterface.find(
                    (i: any) => i.name === 'ElectionCreated'
                );
                if (event) {
                    const decoded = this.web3.eth.abi.decodeLog(
                        event.inputs,
                        receipt.logs[0].data,
                        receipt.logs[0].topics.slice(1)
                    );
                    electionId = decoded.id.toString();
                } else {
                    // Fallback: get from electionCount
                    const count = await this.contract.methods.electionCount().call();
                    electionId = count.toString();
                }
            } else {
                // Last resort: get current election count
                const count = await this.contract.methods.electionCount().call();
                electionId = count.toString();
            }
            
            logger.info(`Election created on EVM: ${electionId}`);
            return { electionId };
        } catch (error: any) {
            logger.error('Error creating election:', error);
            throw new Error(`Failed to create election: ${error.message}`);
        }
    }

    async commitVote(electionId: string, voter: string, commit: string): Promise<TxReceipt> {
        try {
            // Ensure commit is 32 bytes (64 hex chars) and prepend 0x if needed
            let commitHash = commit.startsWith('0x') ? commit.slice(2) : commit;
            // Pad to 64 hex characters if needed
            commitHash = commitHash.padStart(64, '0');
            commitHash = '0x' + commitHash;
            
            const tx = this.contract.methods.commitVote(
                parseInt(electionId),
                commitHash
            );

            const gas = await tx.estimateGas({ from: voter });
            const receipt = await tx.send({
                from: voter,
                gas: gas.toString()
            });

            return {
                txHash: receipt.transactionHash,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed
            };
        } catch (error: any) {
            logger.error('Error committing vote:', error);
            throw new Error(`Failed to commit vote: ${error.message}`);
        }
    }

    async revealVote(electionId: string, voter: string, choice: number, salt: string): Promise<TxReceipt> {
        try {
            // Convert salt to uint256 - salt should be a hex string or number string
            let saltValue: string;
            if (salt.startsWith('0x')) {
                saltValue = salt;
            } else {
                // Treat as hex string if it's all hex characters, otherwise as decimal
                if (/^[0-9a-fA-F]+$/.test(salt)) {
                    saltValue = '0x' + salt;
                } else {
                    saltValue = BigInt(salt).toString();
                }
            }
            
            const tx = this.contract.methods.revealVote(
                parseInt(electionId),
                choice,
                saltValue
            );

            const gas = await tx.estimateGas({ from: voter });
            const receipt = await tx.send({
                from: voter,
                gas: gas.toString()
            });

            return {
                txHash: receipt.transactionHash,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed
            };
        } catch (error: any) {
            logger.error('Error revealing vote:', error);
            throw new Error(`Failed to reveal vote: ${error.message}`);
        }
    }

    async closeElection(electionId: string): Promise<TxReceipt> {
        try {
            const tx = this.contract.methods.closeElection(parseInt(electionId));
            const gas = await tx.estimateGas({ from: this.account.address });
            const receipt = await tx.send({
                from: this.account.address,
                gas: gas.toString()
            });

            return {
                txHash: receipt.transactionHash,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed
            };
        } catch (error: any) {
            logger.error('Error closing election:', error);
            throw new Error(`Failed to close election: ${error.message}`);
        }
    }

    async getTally(electionId: string): Promise<TallyResult[]> {
        try {
            const election = await this.getElection(electionId);
            const candidateCount = election.candidateCount;
            const results: TallyResult[] = [];

            for (let i = 0; i < candidateCount; i++) {
                const votes = await this.contract.methods.getTally(parseInt(electionId), i).call();
                results.push({
                    candidateId: i,
                    votes: parseInt(votes.toString())
                });
            }

            return results;
        } catch (error: any) {
            logger.error('Error getting tally:', error);
            throw new Error(`Failed to get tally: ${error.message}`);
        }
    }

    async isEligible(electionId: string, address: string, proof: string[]): Promise<boolean> {
        try {
            const proofBytes32 = proof.map(p => '0x' + (p.startsWith('0x') ? p.slice(2) : p));
            const result = await this.contract.methods.isEligible(
                parseInt(electionId),
                address,
                proofBytes32
            ).call();
            return result;
        } catch (error: any) {
            logger.error('Error checking eligibility:', error);
            return false;
        }
    }

    async getElection(electionId: string): Promise<any> {
        try {
            const election = await this.contract.methods.getElection(parseInt(electionId)).call();
            return {
                name: election.name,
                startTime: parseInt(election.startTime.toString()),
                endTime: parseInt(election.endTime.toString()),
                candidateCount: parseInt(election.candidateCount.toString()),
                eligibilityRoot: election.eligibilityRoot,
                closed: election.closed
            };
        } catch (error: any) {
            logger.error('Error getting election:', error);
            throw new Error(`Failed to get election: ${error.message}`);
        }
    }
}

