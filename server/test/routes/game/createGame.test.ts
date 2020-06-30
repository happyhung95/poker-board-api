import request from 'supertest'

import app from '../../../src/app'
import * as dbHelper from '../../db-helper'

const name = "Helsinki 29.6"

describe('create game route', () => {
  beforeAll(async () => {
    await dbHelper.connect()
  })

  afterAll(async () => {
    await dbHelper.closeDatabase()
  })

  it('should return created game', async () => {
    const res = await request(app).post('/api/v1/game').send(name)
    expect(res.status).toBe(201)
    expect(res.body).toMatchObject(name)
    expect(res.body).toHaveProperty("_id")
    expect(res.body).toHaveProperty("players")
  })

  it('should return Invalid Request - no name parameters', async () => {
    const res = await request(app).post('/api/v1/game').send()
    expect(res.status).toBe(400)
  })

})
