import mongoose, { Document } from 'mongoose'
import { TransactionDocument, transactionSchema } from './Transaction'

export type PlayerDocument = Document & {
  name: string;
  transactions: TransactionDocument[];
  balance: number;
  createdAt: Date;
}

export const playerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  transactions: [transactionSchema],
  balance: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.model<PlayerDocument>('Player', playerSchema)
