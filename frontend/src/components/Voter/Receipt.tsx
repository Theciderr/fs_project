interface ReceiptProps {
    receipt: any;
}

export default function Receipt({ receipt }: ReceiptProps) {
    if (!receipt) {
        return <div>No receipt available</div>;
    }

    return (
        <div className="receipt">
            <h2>Vote Receipt</h2>
            <div className="receipt-details">
                <p><strong>Transaction Hash:</strong> {receipt.txHash}</p>
                <p><strong>Block Number:</strong> {receipt.blockNumber}</p>
                {receipt.gasUsed && <p><strong>Gas Used:</strong> {receipt.gasUsed}</p>}
                <p><strong>Status:</strong> {receipt.message || 'Success'}</p>
            </div>
            
            <div className="receipt-actions">
                <button onClick={() => window.print()}>Print Receipt</button>
                <button onClick={() => navigator.clipboard.writeText(receipt.txHash)}>
                    Copy Transaction Hash
                </button>
            </div>

            <p className="info">
                Save this receipt for verification. You can use the transaction hash to verify your vote on the blockchain.
            </p>
        </div>
    );
}

