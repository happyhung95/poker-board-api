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

const falseGameId = '5efe4ef5321b172d505bdfa0'

describe('add players route', () => {
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
    transactionList = []
    await dbHelper.clearDatabase()
  })

  afterAll(async () => {
    await dbHelper.closeDatabase()
  })

  it('should return 404, game not found - not existed gameId ', async () => {
    const req = {
      gameId: falseGameId,
      requests: playerList,
    }
    const res = await request(app).post('/api/v1/players').send(req)
    expect(res.status).toBe(404)
  })

  it('should return 400, missing gameId ', async () => {
    const req = {
      // missing gameId
      requests: playerList,
    }
    const res = await request(app).post('/api/v1/players').send(req)
    expect(res.status).toBe(400)
  })

  it('should return 400, missing requests ', async () => {
    const req = {
      gameId,
      // missing requests
    }
    const res = await request(app).post('/api/v1/players').send(req)
    expect(res.status).toBe(400)
  })

  it('should return 400, requests is empty ', async () => {
    const req = {
      gameId,
      requests: [],
    }
    const res = await request(app).post('/api/v1/players').send(req)
    expect(res.status).toBe(400)
  })

  it('should return 400, requests is not array ', async () => {
    const req = {
      gameId,
      requests: {},
    }
    const res = await request(app).post('/api/v1/players').send(req)
    expect(res.status).toBe(400)
  })

  it('should return 400, no name ', async () => {
    const req = {
      gameId,
      requests: [
        {
          type: RequestType.add,
          //missing name
          playerId: null,
        },
      ],
    }
    const res = await request(app).post('/api/v1/players').send(req)
    expect(res.status).toBe(400)
  })

  it('should return 400, client did not input name ', async () => {
    const req = {
      gameId,
      requests: [
        {
          type: RequestType.add,
          name: '',
          playerId: null,
        },
      ],
    }
    const res = await request(app).post('/api/v1/players').send(req)
    expect(res.status).toBe(400)
  })
})
