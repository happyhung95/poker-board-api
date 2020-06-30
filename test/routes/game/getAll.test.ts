import request from 'supertest'

import app from '../../../src/app'
import * as dbHelper from '../../db-helper'
import { generateGame } from '../../helper'


const totalGame = 3

describe('get all game route', () => {
  beforeEach(async () => {
    await dbHelper.connect()
  })
  
  afterEach(async () => {
    await dbHelper.clearDatabase()
  })
  
  afterAll(async () => {
    await dbHelper.closeDatabase()
  })
  
  it(`should return 200, with ${totalGame} games`, async () => {
    await generateGame(totalGame)
    const res = await request(app).get(`/api/v1/`).send()
    expect(res.status).toBe(200)
    expect(res.body.length).toBe(totalGame)
  })
  
  it('should return 200, empty', async () => {
    const res = await request(app).get(`/api/v1/`).send()
    expect(res.status).toBe(200)
    expect(res.body.length).toBe(0)
  })

})
