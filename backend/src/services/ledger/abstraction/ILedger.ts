export interface TxReceipt {
    txHash: string;
    blockNumber: number;
    gasUsed?: number;
}

export interface TallyResult {
    candidateId: number;
    votes: number;
}

export interface CreateElectionParams {
    name: string;
    startTime: number;
    endTime: number;
    candidates: string[];
    eligibilityRoot: string;
}

export interface ElectionResult {
    electionId: string;
}

export interface ILedger {
    createElection(params: CreateElectionParams): Promise<ElectionResult>;
    commitVote(electionId: string, voter: string, commit: string): Promise<TxReceipt>;
    revealVote(electionId: string, voter: string, choice: number, salt: string): Promise<TxReceipt>;
    closeElection(electionId: string): Promise<TxReceipt>;
    getTally(electionId: string): Promise<TallyResult[]>;
    isEligible(electionId: string, address: string, proof: string[]): Promise<boolean>;
    getElection(electionId: string): Promise<any>;
}

