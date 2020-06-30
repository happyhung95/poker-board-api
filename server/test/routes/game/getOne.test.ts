import request from 'supertest'

import app from '../../../src/app'
import * as dbHelper from '../../db-helper'
import { createGame } from '../../helper'

const falseId = '5efa96b41bd5219300bc8c5b'

let gameId: string

describe('get one game route', () => {
  beforeAll(async () => {
    await dbHelper.connect()
    const game = await createGame()
    gameId = game.body._id
  })

  afterAll(async () => {
    await dbHelper.closeDatabase()
  })

  it('should return 204', async () => {
    const res = await request(app).get(`/api/v1/${gameId}`).send()
    expect(res.status).toBe(204)
    expect(res.body._id).toBe(gameId)
  })

  it('should return game not found - false gameId ', async () => {
    const res = await request(app).get(`/api/v1/${falseId}`).send()
    expect(res.status).toBe(404)
  })

})
