import { getContract, disconnect } from './fabric-client';
import { ILedger, TxReceipt, TallyResult, CreateElectionParams, ElectionResult } from '../abstraction/ILedger';
import { logger } from '../../../utils/logger';

export class FabricLedger implements ILedger {
    async createElection(params: CreateElectionParams): Promise<ElectionResult> {
        try {
            const contract = await getContract();
            const electionId = `election_${Date.now()}`;
            const candidatesJson = JSON.stringify(params.candidates);

            await contract.submitTransaction(
                'createElection',
                electionId,
                params.name,
                params.startTime.toString(),
                params.endTime.toString(),
                candidatesJson,
                params.eligibilityRoot
            );

            logger.info(`Election created on Fabric: ${electionId}`);
            return { electionId };
        } catch (error: any) {
            logger.error('Error creating election:', error);
            throw new Error(`Failed to create election: ${error.message}`);
        }
    }

    async commitVote(electionId: string, voter: string, commit: string): Promise<TxReceipt> {
        try {
            const contract = await getContract();
            const result = await contract.submitTransaction(
                'castVote',
                electionId,
                voter,
                commit
            );

            const response = JSON.parse(result.toString());
            return {
                txHash: response.txId,
                blockNumber: 0 // Fabric doesn't use block numbers in the same way
            };
        } catch (error: any) {
            logger.error('Error committing vote:', error);
            throw new Error(`Failed to commit vote: ${error.message}`);
        }
    }

    async revealVote(electionId: string, voter: string, choice: number, salt: string): Promise<TxReceipt> {
        // For Fabric, the reveal happens during the vote casting
        // This is a placeholder - actual implementation depends on your chaincode design
        try {
            const contract = await getContract();
            const encryptedVote = JSON.stringify({ choice, salt });
            const result = await contract.submitTransaction(
                'castVote',
                electionId,
                voter,
                encryptedVote
            );

            const response = JSON.parse(result.toString());
            return {
                txHash: response.txId,
                blockNumber: 0
            };
        } catch (error: any) {
            logger.error('Error revealing vote:', error);
            throw new Error(`Failed to reveal vote: ${error.message}`);
        }
    }

    async closeElection(electionId: string): Promise<TxReceipt> {
        try {
            const contract = await getContract();
            const result = await contract.submitTransaction('closeElection', electionId);
            const response = JSON.parse(result.toString());
            
            return {
                txHash: `close_${electionId}_${Date.now()}`,
                blockNumber: 0
            };
        } catch (error: any) {
            logger.error('Error closing election:', error);
            throw new Error(`Failed to close election: ${error.message}`);
        }
    }

    async getTally(electionId: string): Promise<TallyResult[]> {
        try {
            const contract = await getContract();
            const result = await contract.evaluateTransaction('getTally', electionId);
            const tally = JSON.parse(result.toString());
            
            return Object.entries(tally).map(([candidateId, votes]: [string, any]) => ({
                candidateId: parseInt(candidateId),
                votes: parseInt(votes.toString())
            }));
        } catch (error: any) {
            logger.error('Error getting tally:', error);
            throw new Error(`Failed to get tally: ${error.message}`);
        }
    }

    async isEligible(electionId: string, address: string, proof: string[]): Promise<boolean> {
        // Fabric implementation would depend on your chaincode design
        // This is a placeholder
        try {
            const contract = await getContract();
            const result = await contract.evaluateTransaction('isEligible', electionId, address, JSON.stringify(proof));
            return JSON.parse(result.toString());
        } catch (error: any) {
            logger.error('Error checking eligibility:', error);
            return false;
        }
    }

    async getElection(electionId: string): Promise<any> {
        try {
            const contract = await getContract();
            const result = await contract.evaluateTransaction('getElection', electionId);
            return JSON.parse(result.toString());
        } catch (error: any) {
            logger.error('Error getting election:', error);
            throw new Error(`Failed to get election: ${error.message}`);
        }
    }
}

