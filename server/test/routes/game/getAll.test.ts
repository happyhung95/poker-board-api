import request from 'supertest'

import app from '../../../src/app'
import * as dbHelper from '../../db-helper'
import { generateGame } from '../../helper'


const totalGame = 3

describe('create game route', () => {
  beforeAll(async () => {
    await dbHelper.connect()
    await generateGame(totalGame)
  })

  afterAll(async () => {
    await dbHelper.closeDatabase()
  })

  it('should return 200', async () => {
    const res = await request(app).get(`/api/v1/`).send()
    expect(res.status).toBe(200)
    expect(res.body.length).toBe(totalGame)
  })

})
