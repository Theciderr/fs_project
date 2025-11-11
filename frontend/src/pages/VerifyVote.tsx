import { useState } from 'react';
import { voteApi } from '../services/api';
import TxProof from '../components/common/TxProof';

export default function VerifyVote() {
    const [txHash, setTxHash] = useState('');
    const [receipt, setReceipt] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);
            const result = await voteApi.getReceipt(txHash);
            setReceipt(result);
        } catch (err: any) {
            setError(err.message);
            setReceipt(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="verify-vote">
            <h1>Verify Vote</h1>
            
            <form onSubmit={handleVerify}>
                <div className="form-group">
                    <label>Transaction Hash:</label>
                    <input
                        type="text"
                        value={txHash}
                        onChange={(e) => setTxHash(e.target.value)}
                        placeholder="0x..."
                        required
                    />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? 'Verifying...' : 'Verify'}
                </button>
            </form>

            {error && <div className="error">{error}</div>}

            {receipt && (
                <div className="receipt">
                    <h2>Vote Receipt</h2>
                    <TxProof txHash={receipt.txHash} blockNumber={receipt.blockNumber} />
                    <div className="receipt-details">
                        <p><strong>Action:</strong> {receipt.action}</p>
                        <p><strong>Timestamp:</strong> {new Date(receipt.timestamp).toLocaleString()}</p>
                        <pre>{JSON.stringify(receipt.details, null, 2)}</pre>
                    </div>
                </div>
            )}
        </div>
    );
}

