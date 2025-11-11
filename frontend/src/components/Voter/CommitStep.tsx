import { Election } from '../../services/api';

interface CommitStepProps {
    election: Election;
    candidateId: number;
    onCandidateChange: (id: number) => void;
    onCommit: () => void;
    loading: boolean;
    error: string | null;
}

export default function CommitStep({
    election,
    candidateId,
    onCandidateChange,
    onCommit,
    loading,
    error
}: CommitStepProps) {
    return (
        <div className="vote-flow">
            <h2>Commit Your Vote</h2>
            <p>Election: {election.name}</p>
            
            <div className="candidate-selection">
                <label>Select Candidate:</label>
                <select
                    value={candidateId}
                    onChange={(e) => onCandidateChange(parseInt(e.target.value))}
                    disabled={loading}
                >
                    {election.candidates.map((candidate, index) => (
                        <option key={index} value={index}>
                            {candidate}
                        </option>
                    ))}
                </select>
            </div>

            {error && <div className="error">{error}</div>}

            <button onClick={onCommit} disabled={loading}>
                {loading ? 'Committing...' : 'Commit Vote'}
            </button>

            <p className="info">
                Your vote will be committed as a cryptographic hash. 
                You will reveal it after the election closes.
            </p>
        </div>
    );
}

