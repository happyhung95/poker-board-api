import mongoose, { Document } from 'mongoose'
import { PlayerDocument, playerSchema } from './Player'

export type GameDocument = Document & {
  name: string;
  buyIn: number;
  players: PlayerDocument[];
  gameClosed: boolean;
  deleted: boolean;
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
    gameClosed: {
      type: Boolean,
      default: false,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

export default mongoose.model<GameDocument>('Game', gameSchema)
