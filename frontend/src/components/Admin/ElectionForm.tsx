import { useState } from 'react';
import { electionsApi, Election } from '../../services/api';

interface ElectionFormProps {
    onSuccess: (election: Election) => void;
}

export default function ElectionForm({ onSuccess }: ElectionFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        startTime: '',
        endTime: '',
        candidates: ['']
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);
            
            const candidates = formData.candidates.filter(c => c.trim() !== '');
            const election = await electionsApi.create({
                ...formData,
                candidates
            });
            
            onSuccess(election);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const addCandidate = () => {
        setFormData({
            ...formData,
            candidates: [...formData.candidates, '']
        });
    };

    const updateCandidate = (index: number, value: string) => {
        const candidates = [...formData.candidates];
        candidates[index] = value;
        setFormData({ ...formData, candidates });
    };

    return (
        <form onSubmit={handleSubmit} className="election-form">
            <h2>Create New Election</h2>
            
            <div className="form-group">
                <label>Election Name:</label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                />
            </div>

            <div className="form-group">
                <label>Description:</label>
                <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
            </div>

            <div className="form-group">
                <label>Start Time:</label>
                <input
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                />
            </div>

            <div className="form-group">
                <label>End Time:</label>
                <input
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    required
                />
            </div>

            <div className="form-group">
                <label>Candidates:</label>
                {formData.candidates.map((candidate, index) => (
                    <input
                        key={index}
                        type="text"
                        value={candidate}
                        onChange={(e) => updateCandidate(index, e.target.value)}
                        placeholder={`Candidate ${index + 1}`}
                        required
                    />
                ))}
                <button type="button" onClick={addCandidate}>Add Candidate</button>
            </div>

            {error && <div className="error">{error}</div>}

            <button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Election'}
            </button>
        </form>
    );
}

