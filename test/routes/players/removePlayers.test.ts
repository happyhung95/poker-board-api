import request from 'supertest'

import app from '../../../src/app'
import * as dbHelper from '../../db-helper'
import { createGame } from '../../helper'
import { TransactionDocument } from './../../../src/models/Transaction'
import { PlayerDocument } from './../../../src/models/Player'
import { PlayersRequest, RequestType } from './../../../src/types/types'

let gameId: string
const playerList: PlayersRequest[] = []
let transactionList: TransactionDocument[] = []


describe('remove players route', () => {
  beforeEach(async () => {
    await dbHelper.connect()
    const game = await createGame()
    gameId = game.body._id
    game.body.players.forEach(({ transactions, _id, name }: PlayerDocument) => {
      transactionList.push(...transactions)
      playerList.push({ playerId: _id, name, type: RequestType.remove })
    })
  })

  afterEach(async () => {
    transactionList=[]
    await dbHelper.clearDatabase()
  })

  afterAll(async () => {
    await dbHelper.closeDatabase()
  })

  it('should return 201', async () => {
    const removeTransactions = {
      gameId,
      requests: [
        { type: RequestType.remove, ...transactionList[0], transactionId: transactionList[0]._id },
        { type: RequestType.remove, ...transactionList[1], transactionId: transactionList[1]._id },
        { type: RequestType.remove, ...transactionList[2], transactionId: transactionList[2]._id },
        { type: RequestType.remove, ...transactionList[3], transactionId: transactionList[3]._id },
      ],
    }
    // remove all transactions so balance of every player can be 0 before removal
    await request(app).post('/api/v1/transactions').send(removeTransactions)

    const removePlayers = {
      gameId,
      requests: playerList,
    }

    const res = await request(app).post('/api/v1/players').send(removePlayers)
    expect(res.status).toBe(201)
    expect(res.body.players.length).toBe(0)
  })

  it('should return 400, cannot remove players, balance not 0', async () => {
    const req = {
      gameId,
      requests: playerList,
    }
    const res = await request(app).post('/api/v1/players').send(req)
    expect(res.status).toBe(400)
  })

  it('should return 400, false playerId - player not found', async () => {
    const req = {
      gameId,
      requests: [{
        type: RequestType.remove,
        playerId: 'false Id',
        name: 'I do not exist'
      }],
    }
    const res = await request(app).post('/api/v1/players').send(req)
    expect(res.status).toBe(400)
  })
})
