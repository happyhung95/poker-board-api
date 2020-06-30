import request from 'supertest'

import app from '../../../src/app'
import * as dbHelper from '../../db-helper'
import { createGame } from '../../helper'
import { RequestType } from '../../../src/types/types'
import { PlayerDocument } from '../../../src/models/Player'
import { TransactionDocument } from '../../../src/models/Transaction'

let gameId: string
let transactionList: TransactionDocument[] = []
const falseGameId = '5efe4ef5321b172d505bdfa0'


describe('remove transactions route', () => {
  beforeEach(async () => {
    await dbHelper.connect()
    const game = await createGame()
    gameId = game.body._id
    game.body.players.forEach(({ transactions }: PlayerDocument) => transactionList.push(...transactions))
  })

  afterEach(async () => {
    transactionList = []
    await dbHelper.clearDatabase()
  })

  afterAll(async () => {
    await dbHelper.closeDatabase()
  })

  it('should return 201 - remove all transactions, balance is 0', async () => {
    const req = {
      gameId,
      requests: [
        { type: RequestType.remove, ...transactionList[0], transactionId: transactionList[0]._id },
        { type: RequestType.remove, ...transactionList[1], transactionId: transactionList[1]._id },
        { type: RequestType.remove, ...transactionList[2], transactionId: transactionList[2]._id },
        { type: RequestType.remove, ...transactionList[3], transactionId: transactionList[3]._id },
      ],
    }
    const res = await request(app).post('/api/v1/transactions').send(req)
    expect(res.status).toBe(201)
    res.body.players.forEach(({ transactions, balance }: PlayerDocument) => {
      expect(transactions.length).toBe(0)
      expect(balance).toBe(0)
    })
  })

  it('should return 400 - not existed transactions', async () => {
    const req = {
      gameId,
      requests: [{ type: RequestType.remove, ...transactionList[0], transactionId: 'falseId' }],
    }
    const res = await request(app).post('/api/v1/transactions').send(req)
    expect(res.status).toBe(400)
  })

  it('should return 404 -  game not found ', async () => {
    const req = {
      gameId: falseGameId,
      requests: [{ type: RequestType.remove, ...transactionList[0]}],
    }
    const res = await request(app).post('/api/v1/transactions').send(req)
    expect(res.status).toBe(404)
  })
})
