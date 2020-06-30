import mongoose, { Document } from 'mongoose'
import { PlayerDocument, playerSchema } from './Player'

export type GameDocument = Document & {
  name: string;
  buyIn: number;
  players: PlayerDocument[];
}

const gameSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    buyIn: {
      type: Number,
      required: true,
      trim: true,
    },
    players: [playerSchema],
  },
  { timestamps: true }
)

export default mongoose.model<GameDocument>('Game', gameSchema)
