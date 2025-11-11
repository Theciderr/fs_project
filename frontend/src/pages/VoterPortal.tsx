import { useState, useEffect } from 'react';
import { useElections } from '../hooks/useElection';
import VoteFlow from '../components/Voter/VoteFlow';
import { Election } from '../services/api';

export default function VoterPortal() {
    const { elections, loading, error } = useElections();
    const [selectedElection, setSelectedElection] = useState<Election | null>(null);

    if (loading) return <div>Loading elections...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    if (selectedElection) {
        return (
            <div>
                <button onClick={() => setSelectedElection(null)}>Back to Elections</button>
                <VoteFlow election={selectedElection} />
            </div>
        );
    }

    const openElections = elections.filter(e => e.status === 'open');
    const closedElections = elections.filter(e => e.status === 'closed');

    return (
        <div className="voter-portal">
            <h1>Voter Portal</h1>
            
            <div className="elections-list">
                <h2>Open Elections</h2>
                {openElections.length === 0 ? (
                    <p>No open elections</p>
                ) : (
                    <ul>
                        {openElections.map(election => (
                            <li key={election._id}>
                                <h3>{election.name}</h3>
                                <p>{election.description}</p>
                                <p>Ends: {new Date(election.endTime).toLocaleString()}</p>
                                <button onClick={() => setSelectedElection(election)}>
                                    Vote Now
                                </button>
                            </li>
                        ))}
                    </ul>
                )}

                <h2>Closed Elections</h2>
                {closedElections.length === 0 ? (
                    <p>No closed elections</p>
                ) : (
                    <ul>
                        {closedElections.map(election => (
                            <li key={election._id}>
                                <h3>{election.name}</h3>
                                <p>Status: {election.status}</p>
                                <button onClick={() => setSelectedElection(election)}>
                                    View / Reveal Vote
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

