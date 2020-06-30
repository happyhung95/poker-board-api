import request from 'supertest'

import app from '../../../src/app'
import * as dbHelper from '../../db-helper'

const game = { name: 'helsinki', buyIn: 40 }

describe('create game route', () => {
  beforeEach(async () => {
    await dbHelper.connect()
  })

  afterEach(async () => {
    await dbHelper.clearDatabase()
  })

  afterAll(async () => {
    await dbHelper.closeDatabase()
  })

  it('should return created game', async () => {
    const res = await request(app).post('/api/v1/game').send(game)
    expect(res.status).toBe(201)
    expect(res.body).toMatchObject(game)
    expect(res.body).toHaveProperty("_id")
    expect(res.body).toHaveProperty("players")
  })

  it('should return Invalid Request - no name parameters', async () => {
    const res = await request(app).post('/api/v1/game').send()
    expect(res.status).toBe(400)
  })

})
