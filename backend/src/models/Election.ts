import mongoose, { Schema, Document } from 'mongoose';

export interface IElection extends Document {
    name: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    candidates: string[];
    eligibilityRoot: string;
    ledgerElectionId?: string;
    status: 'draft' | 'open' | 'closed' | 'tallied';
    createdAt: Date;
    updatedAt: Date;
}

const ElectionSchema = new Schema<IElection>(
    {
        name: { type: String, required: true },
        description: { type: String },
        startTime: { type: Date, required: true },
        endTime: { type: Date, required: true },
        candidates: [{ type: String, required: true }],
        eligibilityRoot: { type: String, required: true },
        ledgerElectionId: { type: String },
        status: {
            type: String,
            enum: ['draft', 'open', 'closed', 'tallied'],
            default: 'draft'
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model<IElection>('Election', ElectionSchema);

