import mongoose, { Document } from 'mongoose'

export type TransactionDocument = Document & {
  ownerId: string ;
  counterParty: string;
  amount: number;
  createdAt: Date;
}

export const transactionSchema = new mongoose.Schema({
  ownerId: String,
  counterParty: String,
  amount: Number,
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.model<TransactionDocument>('Transaction', transactionSchema)
