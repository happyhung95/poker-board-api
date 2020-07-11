import { PlayerDocument } from './../../src/models/Player'
import request from 'supertest'

import app from '../../src/app'

const game = { name: 'helsinki', buyIn: 40 }

export let hungId: string
export let clementineId: string

function addPlayers(gameId: string) {
  const req = {
    gameId: gameId,
    requests: [
      { type: 'add', playerId: null, name: 'Hung' },
      { type: 'add', playerId: null, name: 'Clementine' },
    ],
  }
  return request(app).post('/api/v1/players').send(req)
}

export function addTransactions(gameId: string, ownerId: string, counterPartyId: string, amount: number = 40) {
  const req = {
    gameId: gameId,
    requests: [
      { type: 'add', ownerId: ownerId, amount: amount, counterPartyId: counterPartyId, refId: 'unique', transactionId: null },
      { type: 'add', ownerId: counterPartyId, amount: -amount , counterPartyId: ownerId, refId: 'unique', transactionId: null },
    ],
  }
  return request(app).post('/api/v1/transactions').send(req)
}

export async function createGame(override = game) {
  let game = await request(app).post('/api/v1/game').send(override)
  const gameId = game.body._id
  game = await addPlayers(gameId)
  const { players } = game.body
  hungId = players.find((p: PlayerDocument) => p.name === 'Hung')._id
  clementineId = players.find((p: PlayerDocument) => p.name === 'Clementine')._id
  game = await addTransactions(gameId, hungId, clementineId)
  return game
}

export async function generateGame(num: number) {
  for (let i = 1; i < num + 1; i++) {
    const game = { name: `Helsinki ${i}`, buyIn: 40 }
    await createGame(game)
  }
}
