import { Election } from '../../services/api';

interface RevealStepProps {
    election: Election;
    onReveal: () => void;
    loading: boolean;
    error: string | null;
}

export default function RevealStep({
    election,
    onReveal,
    loading,
    error
}: RevealStepProps) {
    return (
        <div className="vote-flow">
            <h2>Reveal Your Vote</h2>
            <p>Election: {election.name}</p>
            
            <p>
                The election has closed. Click the button below to reveal your vote.
            </p>

            {error && <div className="error">{error}</div>}

            <button onClick={onReveal} disabled={loading}>
                {loading ? 'Revealing...' : 'Reveal Vote'}
            </button>

            <p className="info">
                Your vote will be revealed and counted in the final tally.
            </p>
        </div>
    );
}

