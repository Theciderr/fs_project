interface TxProofProps {
    txHash: string;
    blockNumber?: number;
}

export default function TxProof({ txHash, blockNumber }: TxProofProps) {
    return (
        <div className="tx-proof">
            <h3>Transaction Proof</h3>
            <div className="proof-details">
                <p><strong>TX Hash:</strong> <code>{txHash}</code></p>
                {blockNumber && <p><strong>Block:</strong> {blockNumber}</p>}
            </div>
            <p className="info">
                This transaction is recorded on the blockchain and can be verified independently.
            </p>
        </div>
    );
}

