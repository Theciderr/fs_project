import { useState } from 'react';
import { adminApi } from '../../services/api';

interface EligibilityUploadProps {
    onSuccess: () => void;
}

export default function EligibilityUpload({ onSuccess }: EligibilityUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a file');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setSuccess(false);
            
            const result = await adminApi.uploadEligibility(file);
            setSuccess(true);
            onSuccess();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="eligibility-upload">
            <h2>Upload Eligibility List</h2>
            
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>CSV File:</label>
                    <input
                        type="file"
                        accept=".csv"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        required
                    />
                    <p className="info">
                        CSV format: address,voterId
                    </p>
                </div>

                {error && <div className="error">{error}</div>}
                {success && <div className="success">Eligibility list uploaded successfully!</div>}

                <button type="submit" disabled={loading}>
                    {loading ? 'Uploading...' : 'Upload'}
                </button>
            </form>
        </div>
    );
}

