import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
    electionId: mongoose.Types.ObjectId;
    action: string;
    actor: string;
    details: any;
    txHash?: string;
    timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
    {
        electionId: { type: Schema.Types.ObjectId, ref: 'Election', required: true },
        action: { type: String, required: true },
        actor: { type: String, required: true },
        details: { type: Schema.Types.Mixed },
        txHash: { type: String },
        timestamp: { type: Date, default: Date.now }
    },
    {
        timestamps: true
    }
);

AuditLogSchema.index({ electionId: 1, timestamp: -1 });

export default mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

