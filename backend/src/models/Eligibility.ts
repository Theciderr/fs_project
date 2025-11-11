import mongoose, { Schema, Document } from 'mongoose';

export interface IEligibility extends Document {
    electionId: mongoose.Types.ObjectId;
    address: string;
    voterId: string;
    proof?: string[];
    createdAt: Date;
}

const EligibilitySchema = new Schema<IEligibility>(
    {
        electionId: { type: Schema.Types.ObjectId, ref: 'Election', required: true },
        address: { type: String, required: true, index: true },
        voterId: { type: String, required: true },
        proof: [{ type: String }]
    },
    {
        timestamps: true
    }
);

EligibilitySchema.index({ electionId: 1, address: 1 }, { unique: true });

export default mongoose.model<IEligibility>('Eligibility', EligibilitySchema);

