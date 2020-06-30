import { PlayerDocument } from './../../src/models/Player'
import request from 'supertest'

import app from '../../src/app'

const name = 'Helsinki'

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

function addTransactions(gameId: string, hungId: string, clementineId: string) {
  const req = {
    gameId: gameId,
    requests: [
      { type: 'add', ownerId: hungId, amount: -40, counterParty: 'Clementine' },
      { type: 'add', ownerId: clementineId, amount: 40, counterParty: 'Hung' },
    ],
  }
  return request(app).post('/api/v1/transactions').send(req)
}

export async function createGame(override = name) {
  let game = await request(app).post('/api/v1/game').send(override)
  const gameId = game.body._id
  game = await addPlayers(gameId)
  const { players } = game.body
  const hungId = players.find((p: PlayerDocument) => p.name === 'Hung')._id
  const clementineId = players.find((p: PlayerDocument) => p.name === 'Clementine')._id
  game = await addTransactions(gameId, hungId, clementineId)
  return game
}

export async function generateGame(num: number) {
  for (let i = 1; i < num + 1; i++) {
    await createGame(`${name} ${i}`)
  }
}
