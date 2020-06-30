import request from 'supertest'

import app from '../../../src/app'
import * as dbHelper from '../../db-helper'
import { createGame } from '../../helper'

let gameId: string

describe('delete game route', () => {
  beforeEach(async () => {
    await dbHelper.connect()
    const game = await createGame()
    gameId = game.body._id
  })

  afterEach(async () => {
    await dbHelper.clearDatabase()
  })

  afterAll(async () => {
    await dbHelper.closeDatabase()
  })

  it('should return 204', async () => {
    const res = await request(app).delete(`/api/v1/game/${gameId}`).send()
    expect(res.status).toBe(204)

    const check = await request(app).delete(`/api/v1/${gameId}`).send()
    expect(check.status).toBe(404)
  })

  it('should return Cannot find route - no gameId parameters', async () => {
    const res = await request(app).delete(`/api/v1/game/`).send()
    expect(res.status).toBe(404)
  })

})
