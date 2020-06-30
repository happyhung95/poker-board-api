import request from 'supertest'

import app from '../../../src/app'
import * as dbHelper from '../../db-helper'
import { createGame } from '../../helper'
import { PlayerDocument } from '../../../src/models/Player'

type TestObject = {
  _id: string;
  balance: number;
}

let gameId: string
let playerBalanceList: TestObject[] = []

describe('test balance transactions route', () => {
  beforeEach(async () => {
    await dbHelper.connect()
    const game = await createGame() // already have 2 players and multiple transactions
    gameId = game.body._id
    game.body.players.forEach(({ _id, balance }: PlayerDocument) => playerBalanceList.push({ _id, balance }))
  })

  afterEach(async () => {
    playerBalanceList = []
    await dbHelper.clearDatabase()
  })

  afterAll(async () => {
    await dbHelper.closeDatabase()
  })

  it('should return 201, add multiple transactions, balance should increase & decrease by testAmount', async () => {
    const player1 = playerBalanceList[0]
    const player2 = playerBalanceList[1]
    const testAmount = 40
    const req = {
      gameId: gameId,
      requests: [
        {
          // player1 balance + testAmount
          type: 'add',
          ownerId: player1._id,
          amount: testAmount,
          counterPartyId: player2._id,
          refId: 'unique',
          transactionId: null,
        },
        {
          // player2 balance - testAmount
          type: 'add',
          ownerId: player2._id,
          amount: -testAmount,
          counterPartyId: player1._id,
          refId: 'unique',
          transactionId: null,
        },
      ],
    }
    const res = await request(app).post('/api/v1/transactions').send(req)

    expect(res.status).toBe(201)
    res.body.players.forEach(({ balance, _id }: PlayerDocument) => {
      if (_id == player1._id) {
        expect(balance).toBe(player1.balance + testAmount)
      } else {
        expect(balance).toBe(player2.balance - testAmount)
      }
    })
  })

  it('should return 201, add multiple transactions, balance should remain the same', async () => {
    const player1 = playerBalanceList[0]
    const player2 = playerBalanceList[1]
    const testAmount = 40
    const req = {
      gameId: gameId,
      requests: [
        {
          // player1 balance + testAmount
          type: 'add',
          ownerId: player1._id,
          amount: testAmount,
          counterPartyId: player2._id,
          refId: 'unique',
          transactionId: null,
        },
        {
          // player2 balance - testAmount
          type: 'add',
          ownerId: player2._id,
          amount: -testAmount,
          counterPartyId: player1._id,
          refId: 'unique',
          transactionId: null,
        },
        {
          // player1 balance - testAmount
          type: 'add',
          ownerId: player1._id,
          amount: -testAmount,
          counterPartyId: player2._id,
          refId: 'unique',
          transactionId: null,
        },
        {
          // player2 balance + testAmount
          type: 'add',
          ownerId: player2._id,
          amount: testAmount,
          counterPartyId: player1._id,
          refId: 'unique',
          transactionId: null,
        },
      ],
    }
    const res = await request(app).post('/api/v1/transactions').send(req)

    expect(res.status).toBe(201)
    res.body.players.forEach(({ balance, _id }: PlayerDocument) => {
      if (_id == player1._id) {
        expect(balance).toBe(player1.balance)
      } else {
        expect(balance).toBe(player2.balance)
      }
    })
  })
})
