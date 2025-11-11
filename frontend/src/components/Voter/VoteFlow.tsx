import { useState } from 'react';
import { commitVote, revealVote } from '../../services/api';
import { hashCommit, generateSalt } from '../../services/proof';
import CommitStep from './CommitStep';
import RevealStep from './RevealStep';
import Receipt from './Receipt';
import { Election } from '../../services/api';

interface VoteFlowProps {
    election: Election;
}

export default function VoteFlow({ election }: VoteFlowProps) {
    const [step, setStep] = useState<'commit' | 'reveal' | 'receipt'>('commit');
    const [candidateId, setCandidateId] = useState<number>(0);
    const [salt, setSalt] = useState<string>('');
    const [commit, setCommit] = useState<string>('');
    const [receipt, setReceipt] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCommit = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const newSalt = generateSalt();
            setSalt(newSalt);
            const commitHash = hashCommit(candidateId, newSalt);
            setCommit(commitHash);

            const result = await commitVote(election._id, commitHash);
            setReceipt(result);
            setStep('reveal');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleReveal = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const result = await revealVote(election._id, candidateId, salt);
            setReceipt(result);
            setStep('receipt');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (step === 'commit') {
        return (
            <CommitStep
                election={election}
                candidateId={candidateId}
                onCandidateChange={setCandidateId}
                onCommit={handleCommit}
                loading={loading}
                error={error}
            />
        );
    }

    if (step === 'reveal') {
        return (
            <RevealStep
                election={election}
                onReveal={handleReveal}
                loading={loading}
                error={error}
            />
        );
    }

    return <Receipt receipt={receipt} />;
}

