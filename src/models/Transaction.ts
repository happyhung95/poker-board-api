import mongoose, { Document } from 'mongoose'

export type TransactionDocument = Document & {
  refId: string;
  ownerId: string;
  counterPartyId: string;
  description: string;
  amount: number;
  createdAt: Date;
}

export const transactionSchema = new mongoose.Schema({
  refId: String,
  ownerId: String,
  counterPartyId: String,
  description: String,
  amount: Number,
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.model<TransactionDocument>('Transaction', transactionSchema)
